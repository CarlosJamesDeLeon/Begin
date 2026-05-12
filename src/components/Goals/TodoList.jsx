import React, { useState } from 'react';
import styles from './Goals.module.css';

export default function TodoList({ store }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    store.addTask({ title, priority, category });
    setTitle('');
    setCategory('');
    setPriority('Medium');
  };

  const getPriorityClass = (prio) => {
    switch (prio) {
      case 'High': return styles.priorityHigh;
      case 'Low': return styles.priorityLow;
      default: return styles.priorityMed;
    }
  };

  return (
    <div>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Add Task</div>
        <form onSubmit={handleAdd} className={styles.inputGroup}>
          <div className={styles.inputRow}>
            <input 
              className={styles.input} 
              placeholder="What needs to be done?" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              style={{ flex: 2 }}
            />
            <input 
              className={styles.input} 
              placeholder="Category (e.g. Math)" 
              value={category} 
              onChange={e => setCategory(e.target.value)}
            />
            <select 
              className={styles.input} 
              value={priority} 
              onChange={e => setPriority(e.target.value)}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <button type="submit" className={styles.btn} disabled={!title.trim()}>
            Add Task
          </button>
        </form>
      </div>

      <div className={styles.taskList}>
        {store.tasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '20px' }}>No tasks yet.</p>
        ) : (
          store.tasks.map(task => (
            <div key={task.id} className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}>
              <input 
                type="checkbox" 
                className={styles.taskCheckbox}
                checked={task.completed}
                onChange={() => store.updateTask(task.id, { completed: !task.completed })}
              />
              <div className={styles.taskContent}>
                <div className={styles.taskTitle}>{task.title}</div>
                <div className={styles.taskMeta}>
                  <span className={`${styles.priority} ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                  {task.category && <span>• {task.category}</span>}
                </div>
              </div>
              <button 
                className={styles.deleteBtn}
                onClick={() => store.deleteTask(task.id)}
              >
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="10.5" y1="3.5" x2="3.5" y2="10.5"/>
                  <line x1="3.5" y1="3.5" x2="10.5" y2="10.5"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
