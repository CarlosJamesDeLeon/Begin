import React, { useState } from 'react';
import styles from './Goals.module.css';

const PALETTE = [
  { emoji: '🎯', color: '#6B7FD4', bg: 'linear-gradient(135deg,#6B7FD4 0%,#9DA8E8 100%)' },
  { emoji: '✈️', color: '#5DAA88', bg: 'linear-gradient(135deg,#5DAA88 0%,#7EC8A4 100%)' },
  { emoji: '📚', color: '#E2A95B', bg: 'linear-gradient(135deg,#E2A95B 0%,#F0C580 100%)' },
  { emoji: '💪', color: '#C47DB8', bg: 'linear-gradient(135deg,#C47DB8 0%,#D9A0CF 100%)' },
  { emoji: '💰', color: '#5DAA88', bg: 'linear-gradient(135deg,#2C6E49 0%,#5DAA88 100%)' },
  { emoji: '🎨', color: '#E05858', bg: 'linear-gradient(135deg,#E05858 0%,#F09090 100%)' },
  { emoji: '🧘', color: '#8B9FD4', bg: 'linear-gradient(135deg,#8B9FD4 0%,#B5C3E8 100%)' },
  { emoji: '🚀', color: '#2C2C2A', bg: 'linear-gradient(135deg,#2C2C2A 0%,#5A5A56 100%)' },
];

const STATUS_CONFIG = {
  'Not Started': { color: '#999', bg: 'rgba(153,153,153,0.1)', label: 'Not Started' },
  'In Progress':  { color: '#E2A95B', bg: 'rgba(226,169,91,0.12)', label: 'In Progress' },
  'Completed':    { color: '#5DAA88', bg: 'rgba(93,170,136,0.12)', label: 'Done ✓' },
};

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function VisionBoard({ store }) {
  const [title, setTitle]           = useState('');
  const [desc, setDesc]             = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [showForm, setShowForm]     = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    store.addVisionGoal({
      title: title.trim(),
      desc: desc.trim(),
      targetDate: targetDate || null,
      emoji: PALETTE[paletteIdx].emoji,
      bg: PALETTE[paletteIdx].bg,
      color: PALETTE[paletteIdx].color,
    });
    setTitle(''); setDesc(''); setTargetDate(''); setPaletteIdx(0);
    setShowForm(false);
  };

  const notStarted = store.visionGoals.filter(g => g.status === 'Not Started').length;
  const inProgress = store.visionGoals.filter(g => g.status === 'In Progress').length;
  const done       = store.visionGoals.filter(g => g.status === 'Completed').length;

  return (
    <div className={styles.visionWrap}>
      {/* ── Summary bar ── */}
      {store.visionGoals.length > 0 && (
        <div className={styles.visionSummary}>
          <div className={styles.visionSumItem}>
            <span className={styles.visionSumVal}>{store.visionGoals.length}</span>
            <span className={styles.visionSumLbl}>Goals</span>
          </div>
          <div className={styles.todoStatDivider} />
          <div className={styles.visionSumItem}>
            <span className={styles.visionSumVal} style={{ color: '#E2A95B' }}>{inProgress}</span>
            <span className={styles.visionSumLbl}>In Progress</span>
          </div>
          <div className={styles.todoStatDivider} />
          <div className={styles.visionSumItem}>
            <span className={styles.visionSumVal} style={{ color: '#5DAA88' }}>{done}</span>
            <span className={styles.visionSumLbl}>Achieved</span>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className={styles.todoToolbar} style={{ justifyContent: 'flex-end' }}>
        <button className={styles.addTaskBtn} onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ New Goal'}
        </button>
      </div>

      {/* ── Add Form ── */}
      {showForm && (
        <form onSubmit={handleAdd} className={styles.addForm}>
          <input
            className={styles.addFormInput}
            placeholder="Your long-term goal (e.g. Study abroad in Japan)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
          <textarea
            className={`${styles.addFormInput} ${styles.addFormTextarea}`}
            placeholder="Why does this matter to you? (optional)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={3}
          />
          <div className={styles.addFormRow}>
            <input
              className={styles.addFormInput}
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              title="Target date"
            />
          </div>
          <div className={styles.paletteLabel}>Choose a style</div>
          <div className={styles.paletteRow}>
            {PALETTE.map((p, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.paletteSwatch} ${paletteIdx === i ? styles.paletteSelected : ''}`}
                style={{ background: p.bg }}
                onClick={() => setPaletteIdx(i)}
              >
                {p.emoji}
              </button>
            ))}
          </div>
          <button type="submit" className={styles.addFormSubmit} disabled={!title.trim()}>
            Add to Vision Board
          </button>
        </form>
      )}

      {/* ── Vision Grid ── */}
      {store.visionGoals.length === 0 && !showForm ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🌠</div>
          <div className={styles.emptyTitle}>Your vision board is empty</div>
          <div className={styles.emptyDesc}>Add a long-term goal that inspires you.</div>
        </div>
      ) : (
        <div className={styles.visionGrid}>
          {store.visionGoals.map(goal => {
            const stCfg = STATUS_CONFIG[goal.status] || STATUS_CONFIG['Not Started'];
            const isExpanded = expandedId === goal.id;
            const bg = goal.bg || PALETTE[0].bg;
            const emoji = goal.emoji || '🎯';

            const targetTs = goal.targetDate ? new Date(goal.targetDate) : null;
            const daysLeft = targetTs ? Math.ceil((targetTs - Date.now()) / 86400000) : null;

            return (
              <div key={goal.id} className={`${styles.visionCard} ${isExpanded ? styles.visionCardExpanded : ''}`}>
                {/* Card header banner */}
                <div className={styles.visionBanner} style={{ background: bg }}>
                  <div className={styles.visionEmoji}>{emoji}</div>
                  <button className={styles.visionDeleteBtn} onClick={() => store.deleteVisionGoal(goal.id)} aria-label="Delete goal">
                    <svg viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <line x1="10.5" y1="3.5" x2="3.5" y2="10.5" /><line x1="3.5" y1="3.5" x2="10.5" y2="10.5" />
                    </svg>
                  </button>
                </div>

                <div className={styles.visionBody}>
                  <div className={styles.visionTitle}>{goal.title}</div>
                  {goal.desc && (
                    <div
                      className={`${styles.visionDesc} ${isExpanded ? styles.visionDescExpanded : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : goal.id)}
                    >
                      {goal.desc}
                    </div>
                  )}

                  {/* Timeline */}
                  {goal.targetDate && (
                    <div className={styles.visionTimeline}>
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <rect x="1.5" y="1.5" width="9" height="9" rx="2" />
                        <line x1="1.5" y1="4.5" x2="10.5" y2="4.5" />
                        <line x1="4" y1="1.5" x2="4" y2="3" />
                        <line x1="8" y1="1.5" x2="8" y2="3" />
                      </svg>
                      <span>{formatDate(new Date(goal.targetDate).getTime())}</span>
                      {daysLeft !== null && (
                        <span className={`${styles.visionDaysLeft} ${daysLeft < 0 ? styles.due_overdue : daysLeft < 30 ? styles.due_soon : styles.due_ok}`}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Progress slider */}
                  <div className={styles.visionProgressRow}>
                    <span className={styles.visionProgressLbl}>Progress</span>
                    <span className={styles.visionProgressPct}>{goal.progress ?? 0}%</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="100" step="5"
                    value={goal.progress ?? 0}
                    onChange={e => store.updateVisionGoal(goal.id, { progress: parseInt(e.target.value) })}
                    className={styles.visionSlider}
                    style={{ '--progress-color': goal.color || '#6B7FD4' }}
                  />

                  {/* Status selector */}
                  <div className={styles.visionFooter}>
                    <div className={styles.visionAddedDate}>Added {formatDate(goal.createdAt)}</div>
                    <select
                      className={styles.visionStatusSelect}
                      style={{ color: stCfg.color, background: stCfg.bg, borderColor: stCfg.color + '33' }}
                      value={goal.status}
                      onChange={e => store.updateVisionGoal(goal.id, { status: e.target.value })}
                    >
                      {Object.keys(STATUS_CONFIG).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
