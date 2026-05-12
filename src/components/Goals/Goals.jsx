import React, { useState, useEffect } from 'react';
import styles from './Goals.module.css';
import { useGoalsStore } from './useGoalsStore';
import TodoList from './TodoList';
import GpaTracker from './GpaTracker';
import VisionBoard from './VisionBoard';

export default function Goals({ onBack, initialTab = 'todo' }) {
  const store = useGoalsStore();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync state if it changes externally (e.g. from sidebar nav click)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className={styles.page}>
      {/* Header with Sub-Nav */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {onBack && (
            <button className={styles.backBtn} onClick={onBack}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9,2 5,7 9,12"/>
              </svg>
            </button>
          )}
          <div className={styles.headerTitle}>Goals</div>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'todo' ? styles.active : ''}`}
            onClick={() => setActiveTab('todo')}
          >
            To-Do List
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'gpa' ? styles.active : ''}`}
            onClick={() => setActiveTab('gpa')}
          >
            GPA Tracker
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'vision' ? styles.active : ''}`}
            onClick={() => setActiveTab('vision')}
          >
            Vision Board
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className={styles.content}>
        {activeTab === 'todo' && <TodoList store={store} />}
        {activeTab === 'gpa' && <GpaTracker store={store} />}
        {activeTab === 'vision' && <VisionBoard store={store} />}
      </div>
    </div>
  );
}
