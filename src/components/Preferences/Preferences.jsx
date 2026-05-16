import React, { useState } from 'react';
import styles from './Preferences.module.css';
import { usePrefsStore, CURRENCY_OPTIONS, AVATAR_COLORS } from './usePrefsStore';

function Section({ title, desc, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <div className={styles.sectionTitle}>{title}</div>
        {desc && <div className={styles.sectionDesc}>{desc}</div>}
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

export default function Preferences({ onBack }) {
  const prefs = usePrefsStore();
  const [nameInput, setNameInput] = useState(prefs.name);
  const [confirmClear, setConfirmClear] = useState(false);

  const initials = (nameInput || 'You').charAt(0).toUpperCase();

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {onBack && (
            <button className={styles.backBtn} onClick={onBack} aria-label="Back">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9,2 5,7 9,12" />
              </svg>
            </button>
          )}
          <div className={styles.headerTitle}>Preferences</div>
        </div>
      </header>

      <div className={styles.body}>
        {/* ── Profile ── */}
        <Section title="Profile" desc="How you appear across the app.">
          <div className={styles.profileRow}>
            <div className={styles.avatarPreview} style={{ background: prefs.avatarColor }}>
              {initials}
            </div>
            <div className={styles.profileFields}>
              <div className={styles.fieldLabel}>Your Name</div>
              <input
                className={styles.input}
                placeholder="Enter your name…"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onBlur={() => prefs.update({ name: nameInput.trim() })}
                onKeyDown={e => e.key === 'Enter' && prefs.update({ name: nameInput.trim() })}
                maxLength={32}
              />
            </div>
          </div>
          <div className={styles.fieldLabel} style={{ marginTop: 16 }}>Avatar Color</div>
          <div className={styles.colorRow}>
            {AVATAR_COLORS.map(c => (
              <button
                key={c}
                className={`${styles.colorDot} ${prefs.avatarColor === c ? styles.colorDotActive : ''}`}
                style={{ background: c }}
                onClick={() => prefs.update({ avatarColor: c })}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </Section>

        {/* ── Finance / Currency ── */}
        <Section title="Currency" desc="Used throughout the Finance module.">
          <div className={styles.currencyGrid}>
            {CURRENCY_OPTIONS.map(opt => (
              <button
                key={opt.symbol}
                className={`${styles.currencyBtn} ${prefs.currency === opt.symbol ? styles.currencyActive : ''}`}
                onClick={() => prefs.update({ currency: opt.symbol, currencyLocale: opt.locale })}
              >
                <span className={styles.currencySymbol}>{opt.symbol}</span>
                <span className={styles.currencyLabel}>{opt.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* ── GPA Scale ── */}
        <Section title="GPA Scale" desc="Affects grade options and calculations in the GPA Tracker.">
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.toggleBtn} ${prefs.gpaScale === '4.0' ? styles.toggleActive : ''}`}
              onClick={() => prefs.update({ gpaScale: '4.0' })}
            >
              <div className={styles.toggleBtnTitle}>4.0 Scale</div>
              <div className={styles.toggleBtnDesc}>A–F · US / International</div>
            </button>
            <button
              className={`${styles.toggleBtn} ${prefs.gpaScale === 'philippine-1' ? styles.toggleActive : ''}`}
              onClick={() => prefs.update({ gpaScale: 'philippine-1' })}
            >
              <div className={styles.toggleBtnTitle}>Philippine · 1.0 Best</div>
              <div className={styles.toggleBtnDesc}>1.00 = Excellent · UP, DLSU style</div>
            </button>
            <button
              className={`${styles.toggleBtn} ${prefs.gpaScale === 'philippine-5' ? styles.toggleActive : ''}`}
              onClick={() => prefs.update({ gpaScale: 'philippine-5' })}
            >
              <div className={styles.toggleBtnTitle}>Philippine · 5.0 Best</div>
              <div className={styles.toggleBtnDesc}>5.00 = Excellent · CITU, Ateneo style</div>
            </button>
          </div>
        </Section>

        {/* ── Data Management ── */}
        <Section title="Data & Privacy" desc="Your data lives entirely on your device — nothing is sent anywhere.">
          <div className={styles.dataRow}>
            <div>
              <div className={styles.dataActionTitle}>Export Backup</div>
              <div className={styles.dataActionDesc}>Download all your data as a JSON file.</div>
            </div>
            <button className={styles.exportBtn} onClick={prefs.exportAllData}>
              Export JSON
            </button>
          </div>

          <div className={styles.divider} />

          <div className={styles.dataRow}>
            <div>
              <div className={styles.dataActionTitle} style={{ color: '#E05858' }}>Clear All Data</div>
              <div className={styles.dataActionDesc}>Permanently removes all notes, finances, and goals. Cannot be undone.</div>
            </div>
            {!confirmClear ? (
              <button className={styles.dangerBtn} onClick={() => setConfirmClear(true)}>
                Clear Data
              </button>
            ) : (
              <div className={styles.confirmRow}>
                <span className={styles.confirmText}>Are you sure?</span>
                <button className={styles.dangerBtnConfirm} onClick={prefs.clearAllData}>Yes, clear</button>
                <button className={styles.cancelBtn} onClick={() => setConfirmClear(false)}>Cancel</button>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
