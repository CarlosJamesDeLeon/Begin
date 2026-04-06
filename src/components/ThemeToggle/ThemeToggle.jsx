import styles from './ThemeToggle.module.css';

export default function ThemeToggle({ dark, toggle }) {
  return (
    <button
      className={`${styles.toggle} ${dark ? styles.dark : ''}`}
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle dark mode"
    >
      <div className={styles.track}>
        <div className={styles.thumb}>
          {dark ? (
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9A5 5 0 015 2a7 7 0 107 7z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="7" r="3"/>
              <line x1="7" y1="1" x2="7" y2="2.5"/>
              <line x1="7" y1="11.5" x2="7" y2="13"/>
              <line x1="1" y1="7" x2="2.5" y2="7"/>
              <line x1="11.5" y1="7" x2="13" y2="7"/>
              <line x1="2.9" y1="2.9" x2="3.9" y2="3.9"/>
              <line x1="10.1" y1="10.1" x2="11.1" y2="11.1"/>
              <line x1="11.1" y1="2.9" x2="10.1" y2="3.9"/>
              <line x1="3.9" y1="10.1" x2="2.9" y2="11.1"/>
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
