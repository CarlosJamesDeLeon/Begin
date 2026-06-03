const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// All routes here already require a valid JWT (enforced in server.js)
// req.user = { id, email, name }

// ═══════════════════════════════════════════════════════
// NOTEBOOKS
// ═══════════════════════════════════════════════════════

// GET /api/store/notebooks
router.get('/notebooks', async (req, res, next) => {
  try {
    const notebooks = await prisma.notebook.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ notebooks });
  } catch (err) { next(err); }
});

// POST /api/store/notebooks  — create or update
router.post('/notebooks', async (req, res, next) => {
  try {
    const schema = z.object({
      id: z.string().optional(),
      name: z.string().min(1).max(100),
      color: z.string().optional(),
      icon: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    const { id, name, color, icon } = parsed.data;

    const notebook = await prisma.notebook.upsert({
      where: { id: id || '__new__' },
      update: { name, color, icon },
      create: { name, color: color || '#6B7FD4', icon: icon || '📓', userId: req.user.id },
    });

    res.json({ notebook });
  } catch (err) { next(err); }
});

// DELETE /api/store/notebooks/:id
router.delete('/notebooks/:id', async (req, res, next) => {
  try {
    await prisma.notebook.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// NOTES
// ═══════════════════════════════════════════════════════

// GET /api/store/notes?notebookId=xxx
router.get('/notes', async (req, res, next) => {
  try {
    const where = { userId: req.user.id };
    if (req.query.notebookId) where.notebookId = req.query.notebookId;

    const notes = await prisma.note.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ notes });
  } catch (err) { next(err); }
});

// POST /api/store/notes — create or update
router.post('/notes', async (req, res, next) => {
  try {
    const schema = z.object({
      id: z.string().optional(),
      title: z.string().max(255).optional(),
      content: z.string().optional(),
      isPinned: z.boolean().optional(),
      notebookId: z.string(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    const { id, title, content, isPinned, notebookId } = parsed.data;

    // Ensure the notebook belongs to this user
    const notebook = await prisma.notebook.findFirst({
      where: { id: notebookId, userId: req.user.id },
    });
    if (!notebook) return res.status(403).json({ error: 'Notebook not found.' });

    const note = await prisma.note.upsert({
      where: { id: id || '__new__' },
      update: { title, content, isPinned },
      create: {
        title: title || 'Untitled',
        content: content || '',
        isPinned: isPinned || false,
        notebookId,
        userId: req.user.id,
      },
    });

    res.json({ note });
  } catch (err) { next(err); }
});

// DELETE /api/store/notes/:id
router.delete('/notes/:id', async (req, res, next) => {
  try {
    await prisma.note.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// FINANCE
// ═══════════════════════════════════════════════════════

// GET /api/store/finance
router.get('/finance', async (req, res, next) => {
  try {
    const finances = await prisma.finance.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ finances });
  } catch (err) { next(err); }
});

// POST /api/store/finance
router.post('/finance', async (req, res, next) => {
  try {
    const schema = z.object({
      type: z.enum(['income', 'expense']),
      category: z.string().min(1).max(50),
      description: z.string().max(255),
      amount: z.number().positive(),
      date: z.string(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    const finance = await prisma.finance.create({
      data: { ...parsed.data, userId: req.user.id },
    });
    res.status(201).json({ finance });
  } catch (err) { next(err); }
});

// DELETE /api/store/finance/:id
router.delete('/finance/:id', async (req, res, next) => {
  try {
    await prisma.finance.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// GOALS  (flexible JSON blob per type)
// ═══════════════════════════════════════════════════════

// GET /api/store/goals
router.get('/goals', async (req, res, next) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id },
    });
    // Parse JSON blobs before sending
    res.json({ goals: goals.map(g => ({ ...g, data: JSON.parse(g.data) })) });
  } catch (err) { next(err); }
});

// PUT /api/store/goals  (upsert by type)
router.put('/goals', async (req, res, next) => {
  try {
    const schema = z.object({
      type: z.enum(['todo', 'gpa', 'vision']),
      data: z.any(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    const { type, data } = parsed.data;

    const goal = await prisma.goal.upsert({
      where: {
        // unique by userId + type (not enforced at DB level, so we find+replace)
        id: (await prisma.goal.findFirst({ where: { userId: req.user.id, type } }))?.id || '__new__',
      },
      update: { data: JSON.stringify(data) },
      create: { type, data: JSON.stringify(data), userId: req.user.id },
    });

    res.json({ goal: { ...goal, data: JSON.parse(goal.data) } });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// STUDY DATA  (single row per user)
// ═══════════════════════════════════════════════════════

// GET /api/store/study
router.get('/study', async (req, res, next) => {
  try {
    const studyData = await prisma.studyData.findUnique({ where: { userId: req.user.id } });
    res.json({ studyData: studyData ? JSON.parse(studyData.data) : null });
  } catch (err) { next(err); }
});

// PUT /api/store/study
router.put('/study', async (req, res, next) => {
  try {
    const schema = z.object({ data: z.any() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    const studyData = await prisma.studyData.upsert({
      where: { userId: req.user.id },
      update: { data: JSON.stringify(parsed.data.data) },
      create: { userId: req.user.id, data: JSON.stringify(parsed.data.data) },
    });

    res.json({ studyData: JSON.parse(studyData.data) });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// PREFERENCES  (single row per user)
// ═══════════════════════════════════════════════════════

// GET /api/store/preferences
router.get('/preferences', async (req, res, next) => {
  try {
    const prefs = await prisma.preference.findUnique({ where: { userId: req.user.id } });
    res.json({ preferences: prefs ? JSON.parse(prefs.data) : null });
  } catch (err) { next(err); }
});

// PUT /api/store/preferences
router.put('/preferences', async (req, res, next) => {
  try {
    const prefs = await prisma.preference.upsert({
      where: { userId: req.user.id },
      update: { data: JSON.stringify(req.body) },
      create: { userId: req.user.id, data: JSON.stringify(req.body) },
    });
    res.json({ preferences: JSON.parse(prefs.data) });
  } catch (err) { next(err); }
});

module.exports = router;
