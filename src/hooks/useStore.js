import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const KEYS = { notebooks: 'begin_notebooks', notes: 'begin_notes' };

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const uid = () => '_' + Math.random().toString(36).slice(2, 10);

const formatRelative = (ts) => {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
};

const formatDate = (ts) => {
  const d = new Date(ts);
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────
export const useStore = () => {
  const { user, authFetch } = useAuth();

  // Initialise from localStorage for instant paint — overwritten from API on load
  const [notebooks, setNotebooks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEYS.notebooks)) || []; }
    catch { return []; }
  });

  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEYS.notes)) || []; }
    catch { return []; }
  });

  // Keep localStorage in sync as a fast cache
  useEffect(() => {
    localStorage.setItem(KEYS.notebooks, JSON.stringify(notebooks));
  }, [notebooks]);

  useEffect(() => {
    localStorage.setItem(KEYS.notes, JSON.stringify(notes));
  }, [notes]);

  // ── Load from backend on login ──────────────────────
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const [nbRes, nRes] = await Promise.all([
          authFetch('/api/store/notebooks'),
          authFetch('/api/store/notes'),
        ]);

        if (nbRes.ok) {
          const { notebooks: serverNbs } = await nbRes.json();
          setNotebooks(serverNbs);
        }
        if (nRes.ok) {
          const { notes: serverNotes } = await nRes.json();
          setNotes(serverNotes);
        }
      } catch (e) {
        // API unavailable — silently use localStorage cache
        console.warn('[useStore] API load failed, using local cache:', e.message);
      }
    };

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Notebooks ───────────────────────────────────────
  const saveNotebook = useCallback(async (nb) => {
    // Optimistic local update
    setNotebooks(prev => {
      const idx = prev.findIndex(n => n.id === nb.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = nb; return next; }
      return [nb, ...prev];
    });

    if (!user) return; // local-only
    try {
      const res = await authFetch('/api/store/notebooks', {
        method: 'POST',
        body: JSON.stringify({ id: nb.id, name: nb.name, color: nb.color, icon: nb.icon }),
      });
      if (res.ok) {
        const { notebook: saved } = await res.json();
        // Replace temp id with server-generated id
        setNotebooks(prev => prev.map(n => (n.id === nb.id || n.id === saved.id) ? saved : n));
      }
    } catch (e) {
      console.warn('[useStore] saveNotebook API error:', e.message);
    }
  }, [user, authFetch]);

  const deleteNotebook = useCallback(async (id) => {
    setNotebooks(prev => prev.filter(n => n.id !== id));
    setNotes(prev => prev.filter(n => n.notebookId !== id));

    if (!user) return;
    try {
      await authFetch(`/api/store/notebooks/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[useStore] deleteNotebook API error:', e.message);
    }
  }, [user, authFetch]);

  // ── Notes ───────────────────────────────────────────
  const saveNote = useCallback(async (note) => {
    // Optimistic local update
    setNotes(prev => {
      const idx = prev.findIndex(n => n.id === note.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = note; return next; }
      return [note, ...prev];
    });

    if (!user) return;
    try {
      const res = await authFetch('/api/store/notes', {
        method: 'POST',
        body: JSON.stringify({
          id: note.id,
          title: note.title,
          content: note.content,
          isPinned: note.isPinned,
          notebookId: note.notebookId,
        }),
      });
      if (res.ok) {
        const { note: saved } = await res.json();
        setNotes(prev => prev.map(n => (n.id === note.id || n.id === saved.id) ? saved : n));
      }
    } catch (e) {
      console.warn('[useStore] saveNote API error:', e.message);
    }
  }, [user, authFetch]);

  const deleteNote = useCallback(async (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));

    if (!user) return;
    try {
      await authFetch(`/api/store/notes/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[useStore] deleteNote API error:', e.message);
    }
  }, [user, authFetch]);

  // ── Derived ─────────────────────────────────────────
  const getRecent = (limit = 4) =>
    [...notes]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit)
      .map(n => {
        const nb = notebooks.find(nb => nb.id === n.notebookId);
        return {
          type: 'note',
          id: n.id,
          notebookId: n.notebookId,
          name: n.title || 'Untitled',
          meta: nb ? nb.name : 'Notes',
          color: nb ? nb.color : '#6B7FD4',
          time: formatRelative(n.updatedAt),
        };
      });

  return {
    notebooks, setNotebooks, saveNotebook, deleteNotebook,
    notes, setNotes, saveNote, deleteNote,
    getRecent, uid, formatDate,
  };
};
