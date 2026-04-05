import React, { useState, useEffect } from 'react';

const Dashboard = ({ store, navigate }) => {
  const [time, setTime] = useState(new Date());

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

  const stats = [
    { val: '₱2,340', label: 'Saved this month', delta: '↑ 12% vs last', cls: 'up' },
    { val: '4h 20m', label: 'Studied today', delta: '↑ on track', cls: 'up' },
    { val: '7', label: 'Day streak', delta: '↑ best yet', cls: 'up' },
    { val: '22', label: 'Notes this week', delta: '— steady', cls: 'neutral' },
  ];

  const recentItems = store.getRecent(4);

  const noteIconSvg = (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 1.5h9a.5.5 0 01.5.5v12a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5V2a.5.5 0 01.5-.5z" />
      <line x1="5" y1="6" x2="11" y2="6" /><line x1="5" y1="8.5" x2="9" y2="8.5" />
    </svg>
  );

  return (
    <div id="view-dashboard" className="view active">
      {/* Mobile top bar */}
      <header className="mobile-topbar">
        <div className="logo">Begin</div>
        <div className="clock">{h}:{m}</div>
      </header>

      {/* Mobile greeting */}
      <div className="mobile-greeting">
        <div className="greeting-main">{greet} <em>let's go.</em></div>
        <div className="greeting-sub">{dateStr}</div>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-tile">
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-delta ${s.cls}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Mobile nav tabs */}
      <nav className="mobile-nav">
        <button className="mobile-tab" onClick={() => navigate('notebooks')}>
          <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2h10a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
            <line x1="5.5" y1="7" x2="12.5" y2="7" /><line x1="5.5" y1="10" x2="10" y2="10" />
          </svg>
          <span>Notes</span>
        </button>
        <button className="mobile-tab" onClick={() => navigate('finance')}>
          <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4.5" width="14" height="10" rx="1.5" />
            <line x1="2" y1="8" x2="16" y2="8" /><line x1="4.5" y1="11.5" x2="7" y2="11.5" />
          </svg>
          <span>Finance</span>
        </button>
        <button className="mobile-tab">
          <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="9" r="6" /><polyline points="9,6.5 9,9 11,10.5" />
          </svg>
          <span>Study</span>
        </button>
      </nav>

      {/* Jump back in */}
      <section className="recent-section">
        <div className="section-label">Jump back in</div>
        <div className="recent-list">
          {recentItems.length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: '13px', padding: '14px 0' }}>Nothing yet — start writing!</p>
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

      {/* Desktop sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">Begin</div>
        <nav className="sidebar-nav">
          <button className="sidebar-btn" title="Notes" onClick={() => navigate('notebooks')}>
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 2h10a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
              <line x1="5.5" y1="7" x2="12.5" y2="7" /><line x1="5.5" y1="10" x2="10" y2="10" />
            </svg>
          </button>
          <button className="sidebar-btn" title="Finance" onClick={() => navigate('finance')}>
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4.5" width="14" height="10" rx="1.5" />
              <line x1="2" y1="8" x2="16" y2="8" /><line x1="4.5" y1="11.5" x2="7" y2="11.5" />
            </svg>
          </button>
          <button className="sidebar-btn" title="Study">
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="9" r="6" /><polyline points="9,6.5 9,9 11,10.5" />
            </svg>
          </button>
          <div className="sidebar-sep"></div>
          <button className="sidebar-btn" title="Settings">
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="9" r="2.5" />
              <path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4.1 4.1l1 1M12.9 12.9l1 1M12.9 4.1l-1 1M4.1 12.9l1-1" />
            </svg>
          </button>
        </nav>
      </aside>

      {/* Desktop main area */}
      <main className="desktop-main">
        <div className="desktop-toprow">
          <div>
            <div className="desktop-greeting">{greet} <em>let's begin.</em></div>
            <div className="desktop-greeting-sub">Here's where you left off.</div>
          </div>
          <div className="date-pill">{desktopDateStr}</div>
        </div>

        <div className="desktop-stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="d-stat-tile">
              <div className="stat-val">{s.val}</div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-delta ${s.cls}`}>{s.delta}</div>
            </div>
          ))}
        </div>

        <div className="section-label">Jump back in</div>
        <div className="desktop-recent-grid">
          {recentItems.map(item => (
            <div key={item.id} className="d-recent-item" onClick={() => navigate('notebooks')}>
              <div className="ri-icon" style={{ background: `${item.color}22`, color: item.color }}>
                {noteIconSvg}
              </div>
              <div>
                <div className="ri-name">{item.name}</div>
                <div className="ri-meta">{item.meta} · {item.time}</div>
              </div>
              <div className="d-ri-arr">
                <svg viewBox="0 0 13 13"><polyline points="4,3 8,6.5 4,10" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
