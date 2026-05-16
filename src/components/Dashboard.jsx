import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle/ThemeToggle';
import { useFinanceStore } from './Finance/useFinanceStore';
import { useStudyStore } from './Study/useStudyStore';
import { usePrefsStore } from './Preferences/usePrefsStore';

const Dashboard = ({ store, navigate, dark, toggleTheme }) => {
  const [time, setTime] = useState(new Date());
  const [goalsExpanded, setGoalsExpanded] = useState(false);
  
  const finance = useFinanceStore('general');
  const financeSavings = useFinanceStore('savings');
  const study = useStudyStore();
  const prefs = usePrefsStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const h = String(time.getHours()).padStart(2, '0');
  const m = String(time.getMinutes()).padStart(2, '0');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dateStr = `${days[time.getDay()]} · ${mons[time.getMonth()]} ${time.getDate()}, ${time.getFullYear()}`;
  const desktopDateStr = `${days[time.getDay()].slice(0, 3)} · ${mons[time.getMonth()]} ${time.getDate()}`;

  const hour = time.getHours();
  const greet = hour < 12 ? 'Morning,' : hour < 17 ? 'Afternoon,' : 'Evening,';

  const statIcons = [
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,8 7,11 12,4"/></svg>,
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><polyline points="8,5 8,8 10.5,9.5"/></svg>,
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="8,2 10,6 14,7 11,10 12,14 8,12 4,14 5,10 2,7 6,6"/></svg>,
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 2h9a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9A1.5 1.5 0 013.5 2z"/><line x1="6" y1="6" x2="10" y2="6"/><line x1="6" y1="10" x2="10" y2="10"/></svg>,
  ];

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const notesThisWeek = store.notes.filter(n => n.updatedAt > oneWeekAgo).length;

  const stats = [
    { val: `₱${finance.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, label: 'General Balance', delta: finance.balance >= 0 ? '↑ on track' : '↓ low', cls: finance.balance >= 0 ? 'up' : 'down', iconCls: 'icon-green', icon: statIcons[0] },
    { val: study.fmtMinutes(study.todayMinutes) || '0m', label: 'Studied today', delta: study.todayMinutes > 0 ? '↑ growing' : '— resting', cls: study.todayMinutes > 0 ? 'up' : 'neutral', iconCls: 'icon-purple', icon: statIcons[1] },
    { val: study.streak.toString(), label: 'Day streak', delta: study.streak > 0 ? '🔥 active' : '—', cls: study.streak > 0 ? 'up' : 'neutral', iconCls: 'icon-orange', icon: statIcons[2] },
    { val: notesThisWeek.toString(), label: 'Notes this week', delta: notesThisWeek > 0 ? '↑ productive' : '— steady', cls: notesThisWeek > 0 ? 'up' : 'neutral', iconCls: 'icon-blue', icon: statIcons[3] },
  ];

  const recentItems = store.getRecent(5);

  const noteIconSvg = (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 1.5h9a.5.5 0 01.5.5v12a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5V2a.5.5 0 01.5-.5z" />
      <line x1="5" y1="6" x2="11" y2="6" /><line x1="5" y1="8.5" x2="9" y2="8.5" />
    </svg>
  );

  const navButtons = [
    {
      title: 'Finance', view: 'finance',
      icon: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4.5" width="14" height="10" rx="1.5" /><line x1="2" y1="8" x2="16" y2="8" /><line x1="4.5" y1="11.5" x2="7" y2="11.5" /></svg>,
    },
    {
      title: 'Study', view: 'study',
      icon: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="6" /><polyline points="9,6.5 9,9 11,10.5" /></svg>,
    },
    {
      title: 'Notes', view: 'notebooks',
      icon: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h10a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" /><line x1="5.5" y1="7" x2="12.5" y2="7" /><line x1="5.5" y1="10" x2="10" y2="10" /></svg>,
    },
    {
      title: 'Goals', view: 'goals',
      icon: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16h10M4 14V2l9 3.5L4 9"/></svg>,
    },
  ];

  const dashIcon = <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="6" height="6" rx="1.5"/><rect x="10" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="10" width="6" height="6" rx="1.5"/><rect x="10" y="10" width="6" height="6" rx="1.5"/></svg>;

  const prefIcon = <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="2.5" /><path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4.1 4.1l1 1M12.9 12.9l1 1M12.9 4.1l-1 1M4.1 12.9l1-1" /></svg>;

  return (
    <div id="view-dashboard" className="view active">

      {/* ── Mobile top bar ── */}
      <header className="mobile-topbar">
        <div className="logo">Begin</div>
        <div className="topbar-actions">
          <ThemeToggle dark={dark} toggle={toggleTheme} />
          <div className="clock">{h}:{m}</div>
        </div>
      </header>

      <div className="mobile-greeting">
        <div className="greeting-main">{greet} <em>let's go.</em></div>
        <div className="greeting-sub">{dateStr}</div>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-tile">
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-delta ${s.cls}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      <nav className="mobile-nav">
        {navButtons.map(btn => (
          <button key={btn.view} className="mobile-tab" onClick={() => navigate(btn.view)}>
            {btn.icon}
            <span>{btn.title}</span>
          </button>
        ))}
      </nav>

      <section className="recent-section">
        <div className="section-label">JUMP BACK IN</div>
        <div className="recent-list">
          {recentItems.length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: '13px', padding: '14px 0' }}>
              Nothing yet — start writing!
            </p>
          ) : (
            recentItems.map(item => (
              <div key={item.id} className="recent-item" onClick={() => navigate('note-list', { notebookId: item.notebookId })}>
                <div className="ri-icon" style={{ background: `${item.color}22`, color: item.color }}>
                  {noteIconSvg}
                </div>
                <div>
                  <div className="ri-name">{item.name}</div>
                  <div className="ri-meta">{item.meta}</div>
                </div>
                <div className="ri-time">{item.time}</div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Desktop sidebar ── */}
      <aside className="desktop-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">Begin</div>
          <div className="sidebar-subtitle">Your personal OS</div>
        </div>

        <div className="sidebar-nav-container">
          <div className="sidebar-section">
            <div className="sidebar-section-title">OVERVIEW</div>
            <button className="sidebar-nav-item active" onClick={() => navigate('dashboard')}>
              <span className="sidebar-icon">{dashIcon}</span>
              <span className="sidebar-label">Dashboard</span>
            </button>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">MODULES</div>
            {navButtons.map(btn => {
              if (btn.view === 'goals') {
                return (
                  <div key={btn.view}>
                    <button className="sidebar-nav-item" onClick={() => setGoalsExpanded(!goalsExpanded)}>
                      <span className="sidebar-icon">{btn.icon}</span>
                      <span className="sidebar-label">{btn.title}</span>
                      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', opacity: 0.5, transform: goalsExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,1 5,5 9,1"/></svg>
                      </span>
                    </button>
                    {goalsExpanded && (
                      <div className="sidebar-sub-nav">
                        <button className="sidebar-sub-item" onClick={() => navigate('goals', { initialTab: 'todo' })}>To-Do List</button>
                        <button className="sidebar-sub-item" onClick={() => navigate('goals', { initialTab: 'gpa' })}>GPA Tracker</button>
                        <button className="sidebar-sub-item" onClick={() => navigate('goals', { initialTab: 'vision' })}>Vision Board</button>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <button key={btn.view} className="sidebar-nav-item" onClick={() => navigate(btn.view)}>
                  <span className="sidebar-icon">{btn.icon}</span>
                  <span className="sidebar-label">{btn.title}</span>
                </button>
              );
            })}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">SETTINGS</div>
            <button className="sidebar-nav-item" onClick={() => navigate('preferences')}>
              <span className="sidebar-icon">{prefIcon}</span>
              <span className="sidebar-label">Preferences</span>
            </button>
          </div>
        </div>

        <div className="sidebar-profile">
          <div className="profile-info-wrap">
            <div className="profile-avatar" style={{ background: prefs.avatarColor }}>
              {(prefs.name || 'You').charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <span className="profile-name">{prefs.name || 'You'}</span>
              <span className="profile-role">Student</span>
            </div>
          </div>
          <ThemeToggle dark={dark} toggle={toggleTheme} />
        </div>
      </aside>

      {/* ── Desktop header ── */}
      <header className="desktop-header">
        <div>
          <div className="desktop-greeting">{greet} <em>let's begin.</em></div>
          <div className="desktop-greeting-sub">Here's where you left off.</div>
        </div>
        <div className="toprow-actions">
          <button className="search-btn">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="7" r="4"/><line x1="10" y1="10" x2="13" y2="13"/>
            </svg>
            <span>Search...</span>
          </button>
          <div className="date-pill">{desktopDateStr}</div>
        </div>
      </header>

      {/* ── Desktop main ── */}
      <main className="desktop-main">

        <div className="desktop-stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="d-stat-tile">
              <div className="d-stat-header">
                <div className={`d-stat-icon ${s.iconCls}`}>{s.icon}</div>
                <div className={`d-stat-delta ${s.cls}`}>{s.delta}</div>
              </div>
              <div className="d-stat-content">
                <div className="stat-val">{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="desktop-content-grid">
          <div className="left-col">
            <div className="section-label">JUMP BACK IN</div>
            <div className="desktop-recent-list-container">
              {recentItems.map((item, idx) => {
                const colors = ['#9D8FE6', '#9D8FE6', '#6D9BD2', '#E2A98B', '#5DAA88'];
                const accentColor = colors[idx % colors.length];
                return (
                  <div key={item.id} className="d-recent-list-item" onClick={() => navigate('notebooks')}>
                    <div className="d-recent-list-line" style={{ background: accentColor }} />
                    <div className="d-recent-list-info">
                      <div className="d-ri-name">{item.name}</div>
                      <div className="d-ri-meta">{item.meta} · {item.time}</div>
                    </div>
                    <div className="d-ri-chevron">
                      <svg viewBox="0 0 13 13"><polyline points="4,3 8,6.5 4,10" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="right-col">
            <div className="widget-section">
              <div className="section-label">TODAY'S STUDY</div>
              <div className="d-widget-card today-study-widget" onClick={() => navigate('study')} style={{ cursor: 'pointer' }}>
                <div className="ts-header">
                  <div className="ts-label">Focus blocks completed</div>
                  <div className="ts-val">{study.fmtMinutes(study.todayMinutes) || '0m'}</div>
                </div>
                <div className="ts-blocks">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`ts-block ${i < study.todaySessions ? 'filled' : 'empty'}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="widget-section">
              <div className="section-label">FINANCE — SAVINGS</div>
              <div className="d-widget-card finance-widget" onClick={() => navigate('finance')} style={{ cursor: 'pointer' }}>
                <div className="fw-balance">₱{financeSavings.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                <div className="fw-balance-label">Current savings balance</div>
                <div className="fw-progress">
                  <div className="fw-progress-fill" style={{ width: `${Math.min(100, (financeSavings.balance / 10000) * 100)}%` }}></div>
                </div>
                <div className="fw-breakdown">
                  <div className="fw-row">
                    <span className="fw-row-label">Saved</span>
                    <span className="fw-row-val in">+₱{financeSavings.totalIn.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="fw-row">
                    <span className="fw-row-label">Withdrawn</span>
                    <span className="fw-row-val out">−₱{financeSavings.totalOut.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Dashboard;