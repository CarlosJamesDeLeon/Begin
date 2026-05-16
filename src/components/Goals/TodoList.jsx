import React, { useState, useMemo } from 'react';
import styles from './Goals.module.css';

const PRIORITY_CONFIG = {
  High:   { color: '#E05858', bg: 'rgba(224,88,88,0.1)',   label: 'High' },
  Medium: { color: '#E2A95B', bg: 'rgba(226,169,91,0.1)',  label: 'Med' },
  Low:    { color: '#5DAA88', bg: 'rgba(93,170,136,0.1)',  label: 'Low' },
};

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDueStatus(dueDate) {
  if (!dueDate) return null;
  const now = new Date(); now.setHours(0,0,0,0);
  const due = new Date(dueDate); due.setHours(0,0,0,0);
  const diff = Math.round((due - now) / 86400000);
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, cls: 'overdue' };
  if (diff === 0) return { label: 'Due today', cls: 'today' };
  if (diff === 1) return { label: 'Due tomorrow', cls: 'soon' };
  if (diff <= 3) return { label: `${diff}d left`, cls: 'soon' };
  return { label: `${diff}d left`, cls: 'ok' };
}

export default function TodoList({ store }) {
  const [title, setTitle]       = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate]   = useState('');
  const [filter, setFilter]     = useState('all'); // all | active | completed
  const [sortBy, setSortBy]     = useState('created'); // created | due | priority
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    store.addTask({ title: title.trim(), priority, category: category.trim(), dueDate: dueDate || null });
    setTitle(''); setCategory(''); setDueDate(''); setPriority('Medium');
    setShowForm(false);
  };

  const filtered = useMemo(() => {
    let tasks = [...store.tasks];
    if (filter === 'active')    tasks = tasks.filter(t => !t.completed);
    if (filter === 'completed') tasks = tasks.filter(t => t.completed);

    tasks.sort((a, b) => {
      if (sortBy === 'due') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === 'priority') {
        const order = { High: 0, Medium: 1, Low: 2 };
        return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
      }
      return b.createdAt - a.createdAt;
    });
    return tasks;
  }, [store.tasks, filter, sortBy]);

  const total     = store.tasks.length;
  const completed = store.tasks.filter(t => t.completed).length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={styles.todoWrap}>
      {/* ── Stats bar ── */}
      <div className={styles.todoStats}>
        <div className={styles.todoStatItem}>
          <span className={styles.todoStatVal}>{total}</span>
          <span className={styles.todoStatLbl}>Total</span>
        </div>
        <div className={styles.todoStatDivider} />
        <div className={styles.todoStatItem}>
          <span className={styles.todoStatVal}>{total - completed}</span>
          <span className={styles.todoStatLbl}>Remaining</span>
        </div>
        <div className={styles.todoStatDivider} />
        <div className={styles.todoStatItem}>
          <span className={styles.todoStatVal}>{completed}</span>
          <span className={styles.todoStatLbl}>Done</span>
        </div>
        <div className={styles.todoProgressWrap}>
          <div className={styles.todoProgressBar}>
            <div className={styles.todoProgressFill} style={{ width: `${pct}%` }} />
          </div>
          <span className={styles.todoProgressPct}>{pct}%</span>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className={styles.todoToolbar}>
        <div className={styles.filterGroup}>
          {['all', 'active', 'completed'].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className={styles.toolbarRight}>
          <select className={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="created">Newest</option>
            <option value="due">Due Date</option>
            <option value="priority">Priority</option>
          </select>
          {completed > 0 && (
            <button className={styles.clearBtn} onClick={store.clearCompletedTasks}>
              Clear done
            </button>
          )}
          <button className={styles.addTaskBtn} onClick={() => setShowForm(s => !s)}>
            {showForm ? '✕ Cancel' : '+ Add Task'}
          </button>
        </div>
      </div>

      {/* ── Add Form ── */}
      {showForm && (
        <form onSubmit={handleAdd} className={styles.addForm}>
          <input
            className={styles.addFormInput}
            placeholder="What needs to be done?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
          <div className={styles.addFormRow}>
            <input
              className={styles.addFormInput}
              placeholder="Category (e.g. Math)"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
            <input
              className={styles.addFormInput}
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              title="Due date"
            />
            <select
              className={styles.addFormInput}
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              {Object.keys(PRIORITY_CONFIG).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <button type="submit" className={styles.addFormSubmit} disabled={!title.trim()}>
            Add Task
          </button>
        </form>
      )}

      {/* ── Task List ── */}
      <div className={styles.taskList}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✓</div>
            <div className={styles.emptyTitle}>
              {filter === 'completed' ? 'Nothing completed yet' : 'All clear!'}
            </div>
            <div className={styles.emptyDesc}>
              {filter === 'completed' ? 'Finish a task to see it here.' : 'Add a task to get started.'}
            </div>
          </div>
        ) : (
          filtered.map(task => {
            const pCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;
            const due  = getDueStatus(task.dueDate);
            return (
              <div
                key={task.id}
                className={`${styles.taskItem} ${task.completed ? styles.taskCompleted : ''}`}
              >
                <button
                  className={`${styles.taskCheck} ${task.completed ? styles.taskCheckDone : ''}`}
                  onClick={() => store.updateTask(task.id, { completed: !task.completed })}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed && (
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  )}
                </button>

                <div className={styles.taskBody}>
                  <div className={styles.taskTitle}>{task.title}</div>
                  <div className={styles.taskMeta}>
                    <span
                      className={styles.taskPriority}
                      style={{ color: pCfg.color, background: pCfg.bg }}
                    >
                      {pCfg.label}
                    </span>
                    {task.category && (
                      <span className={styles.taskCategory}>{task.category}</span>
                    )}
                    {due && (
                      <span className={`${styles.taskDue} ${styles['due_' + due.cls]}`}>
                        {due.label}
                      </span>
                    )}
                    {!due && task.dueDate && (
                      <span className={styles.taskDue}>{formatDate(task.dueDate)}</span>
                    )}
                    <span className={styles.taskCreated}>Added {formatDate(task.createdAt)}</span>
                  </div>
                </div>

                <button
                  className={styles.taskDelete}
                  onClick={() => store.deleteTask(task.id)}
                  aria-label="Delete task"
                >
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="10.5" y1="3.5" x2="3.5" y2="10.5" />
                    <line x1="3.5" y1="3.5" x2="10.5" y2="10.5" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
