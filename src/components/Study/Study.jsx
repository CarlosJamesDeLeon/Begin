import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Study.module.css';
import { useStudyStore } from './useStudyStore';
import { TECHNIQUES } from './techniques';
import Garden from './Garden';
import Flower from './Flower';

const RING_R = 72;
const RING_CIRC = 2 * Math.PI * RING_R;
const RING_SIZE = 170;

function pad(n) { return String(n).padStart(2, '0'); }

export default function Study({ onBack }) {
  const store = useStudyStore();

  const [technique, setTechnique]         = useState(TECHNIQUES[0]);
  const [customDuration, setCustomDuration] = useState(30);
  const [customBreak, setCustomBreak]     = useState(5);

  const [phase, setPhase]       = useState('idle'); // idle | focus | break | done
  const [sessionNum, setSession] = useState(0);
  const [secsLeft, setSecsLeft]  = useState(null);
  const [running, setRunning]    = useState(false);
  const [lastFlower, setLastFlower] = useState(null);

  const timerRef = useRef(null);

  const focusMins  = technique.id === 'custom' ? customDuration : technique.duration;
  const breakMins  = technique.id === 'custom' ? customBreak    : technique.break;
  const totalSess  = technique.sessions;

  const displaySecs = secsLeft !== null ? secsLeft : focusMins * 60;
  const totalSecs   = phase === 'break' ? breakMins * 60 : focusMins * 60;
  const progress    = displaySecs / totalSecs;
  const strokeOffset = RING_CIRC * (1 - progress);

  const ringColor = phase === 'break' ? '#5DAA88'
    : technique.id === 'pomodoro' ? '#D4956B'
    : technique.id === 'short'    ? '#6B7FD4'
    : technique.id === 'deep'     ? '#5DAA88'
    : '#C47DB8';

  const phaseLabel = phase === 'idle'  ? 'Ready'
    : phase === 'focus'  ? 'Growing…'
    : phase === 'break'  ? 'Rest'
    : 'Done';

  /* ── tick ── */
  const tick = useCallback(() => {
    setSecsLeft(prev => {
      if (prev <= 1) {
        clearInterval(timerRef.current);
        setRunning(false);
        handlePhaseEnd();
        return 0;
      }
      return prev - 1;
    });
  }, [phase, sessionNum, totalSess, focusMins, breakMins]);

  function handlePhaseEnd() {
    if (phase === 'focus') {
      const flower = store.completeSession(focusMins);
      setLastFlower(flower);
      const nextSess = sessionNum + 1;
      if (nextSess >= totalSess) {
        setPhase('done');
        setSession(nextSess);
      } else {
        setPhase('break');
        setSession(nextSess);
        setSecsLeft(breakMins * 60);
      }
    } else if (phase === 'break') {
      setPhase('focus');
      setSecsLeft(focusMins * 60);
    }
  }

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running, tick]);

  function handlePlayPause() {
    if (phase === 'idle') {
      setPhase('focus');
      setSecsLeft(focusMins * 60);
      setRunning(true);
    } else if (phase === 'done') {
      return;
    } else {
      setRunning(r => !r);
    }
  }

  function handleReset() {
    clearInterval(timerRef.current);
    setPhase('idle');
    setSession(0);
    setSecsLeft(null);
    setRunning(false);
    setLastFlower(null);
  }

  function handleSkip() {
    clearInterval(timerRef.current);
    setRunning(false);
    handlePhaseEnd();
  }

  function handleNewSession() {
    handleReset();
  }

  function handleSaveReset() {
    store.resetForTomorrow();
    handleReset();
  }

  function selectTechnique(t) {
    if (phase !== 'idle') return;
    setTechnique(t);
    setSecsLeft(null);
  }

  const isActive = phase === 'focus' || phase === 'break';

  /* ── session dots ── */
  const dots = Array.from({ length: totalSess }).map((_, i) => {
    if (i < sessionNum) return 'done';
    if (i === sessionNum && phase === 'focus') return 'current';
    return 'empty';
  });

  /* ══════════════════════════════
     DONE SCREEN
  ══════════════════════════════ */
  if (phase === 'done') {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            {onBack && <button className={styles.backBtn} onClick={onBack}><svg viewBox="0 0 14 14"><polyline points="9,2 5,7 9,12"/></svg></button>}
            <div className={styles.headerTitle}>Study</div>
          </div>
          <div className={styles.streakPill}>
            <svg viewBox="0 0 12 12"><path d="M6 1c0 3-4 4-4 7a4 4 0 008 0c0-3-4-4-4-7z"/></svg>
            {store.streak} days
          </div>
        </header>

        <div className={styles.doneWrap}>
          <div className={styles.doneGarden}>
            <div className={styles.doneGardenPlants}>
              {store.garden.map(f => (
                <Flower key={f.id} stage="bloom" color={f.color} center={f.center} height={90} />
              ))}
            </div>
            <div className={styles.doneGround} />
          </div>

          <div className={styles.doneTitle}>Your garden bloomed!</div>
          <div className={styles.doneSub}>
            {totalSess} sessions · {store.fmtMinutes(store.todayMinutes)} of focus today.
            <br />You grew {store.todaySessions} flower{store.todaySessions !== 1 ? 's' : ''}.
          </div>

          {lastFlower && (
            <div className={styles.doneFlowerBadge}>
              + New flower: {lastFlower.name}
            </div>
          )}

          <div className={styles.doneGrid}>
            <div className={styles.doneStat}>
              <div className={styles.doneStatVal}>{store.todaySessions}</div>
              <div className={styles.doneStatLbl}>Sessions</div>
            </div>
            <div className={styles.doneStat}>
              <div className={styles.doneStatVal}>{store.fmtMinutes(store.todayMinutes)}</div>
              <div className={styles.doneStatLbl}>Focus time</div>
            </div>
            <div className={styles.doneStat}>
              <div className={styles.doneStatVal}>{store.streak}</div>
              <div className={styles.doneStatLbl}>Day streak</div>
            </div>
            <div className={styles.doneStat}>
              <div className={styles.doneStatVal}>{store.totalFlowers}</div>
              <div className={styles.doneStatLbl}>Total flowers</div>
            </div>
          </div>

          <button className={styles.primaryBtn} onClick={handleNewSession}>
            Start new session
          </button>
          <button className={styles.secondaryBtn} onClick={handleSaveReset}>
            Save & reset for tomorrow
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════
     MAIN SCREEN
  ══════════════════════════════ */
  const LeftCol = (
    <>
      {/* Timer */}
      <div className={styles.timerSection}>
        <div className={styles.ringWrap} style={{ width: RING_SIZE, height: RING_SIZE }}>
          <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
            <circle cx={RING_SIZE/2} cy={RING_SIZE/2} r={RING_R} fill="none" stroke="#EDEAE6" strokeWidth="7"/>
            <circle
              cx={RING_SIZE/2} cy={RING_SIZE/2} r={RING_R}
              fill="none" stroke={ringColor} strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={strokeOffset}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
            />
          </svg>
          <div className={styles.ringCenter}>
            <div className={styles.ringTime}>
              {pad(Math.floor(displaySecs / 60))}:{pad(displaySecs % 60)}
            </div>
            <div className={styles.ringPhase}>{phaseLabel}</div>
          </div>
        </div>

        <div className={styles.ctrlRow}>
          <button className={styles.ctrlSec} onClick={handleReset} title="Reset">
            <svg viewBox="0 0 16 16"><polyline points="14,2 6,8 14,14"/><line x1="2" y1="2" x2="2" y2="14"/></svg>
          </button>
          <button className={styles.ctrlPlay} onClick={handlePlayPause}>
            {running ? (
              <svg viewBox="0 0 20 20"><rect x="5" y="4" width="3.5" height="12" rx="1"/><rect x="11.5" y="4" width="3.5" height="12" rx="1"/></svg>
            ) : (
              <svg viewBox="0 0 20 20"><polygon points="6,3 17,10 6,17"/></svg>
            )}
          </button>
          <button className={styles.ctrlSec} onClick={handleSkip} title="Skip">
            <svg viewBox="0 0 16 16"><polyline points="2,2 10,8 2,14"/><line x1="14" y1="2" x2="14" y2="14"/></svg>
          </button>
        </div>

        <div className={styles.sessionDots}>
          {dots.map((d, i) => (
            <div key={i} className={`${styles.sDot} ${d === 'done' ? styles.done : d === 'current' ? styles.current : ''}`} />
          ))}
          <span className={styles.sDotLabel}>
            {phase === 'idle' ? `${totalSess} sessions planned` : `Session ${sessionNum + 1} of ${totalSess}`}
          </span>
        </div>
      </div>

      {/* Garden */}
      <div className={styles.gardenSection}>
        <div className={styles.gardenHeader}>
          <div className={styles.gardenTitle}>Your garden</div>
          <div className={styles.gardenDay}>Day {store.streak || 1}</div>
        </div>
        <Garden
          garden={store.garden}
          todaySessions={store.todaySessions}
          activeSession={phase === 'focus'}
          nextFlower={store.getNextFlower()}
        />
        <div className={styles.sessionBadge}>
          <div className={styles.badgeIcon}>
            <svg viewBox="0 0 14 14"><polyline points="2,7 5,10 12,4"/></svg>
          </div>
          <div className={styles.badgeText}>
            <div className={styles.badgeMain}>
              {store.todaySessions} session{store.todaySessions !== 1 ? 's' : ''} done today
            </div>
            <div className={styles.badgeSub}>Each session blooms a flower</div>
          </div>
          <div className={styles.badgeCount}>{store.totalFlowers}</div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCell}>
          <div className={styles.statVal}>{store.fmtMinutes(store.todayMinutes || 0)}</div>
          <div className={styles.statLbl}>Studied today</div>
          {store.todayMinutes > 0 && <div className={styles.statUp}>↑ keep it up</div>}
        </div>
        <div className={styles.statCell}>
          <div className={styles.statVal}>{store.totalFlowers}</div>
          <div className={styles.statLbl}>Flowers grown</div>
          {store.totalFlowers > 0 && <div className={styles.statUp}>↑ all time</div>}
        </div>
      </div>
    </>
  );

  const RightCol = (
    <div className={styles.techniqueSection}>
      <div className={styles.sectionLabel}>Study technique</div>
      <div className={styles.techniqueGrid}>
        {TECHNIQUES.map(t => (
          <button
            key={t.id}
            className={`${styles.techniqueCard} ${technique.id === t.id ? styles.selected : ''}`}
            style={technique.id === t.id ? { borderColor: t.color } : {}}
            onClick={() => selectTechnique(t)}
            disabled={isActive}
          >
            <div
              className={styles.techPill}
              style={{ background: t.bg, color: t.color }}
            >
              {t.id === 'custom' ? 'Custom' : `${t.duration} min`}
            </div>
            <div className={styles.techName}>{t.name}</div>
            <div className={styles.techDuration}>
              {t.id === 'custom'
                ? `${customDuration}m focus · ${customBreak}m break`
                : `${t.duration}m focus · ${t.break}m break · ${t.sessions} sessions`}
            </div>
            <div className={styles.techDesc}>{t.description}</div>

            {t.customizable && technique.id === 'custom' && (
              <div className={styles.customRow} onClick={e => e.stopPropagation()}>
                <input
                  className={styles.customInput}
                  type="number" min="5" max="120"
                  value={customDuration}
                  onChange={e => setCustomDuration(+e.target.value)}
                  placeholder="Focus min"
                />
                <input
                  className={styles.customInput}
                  type="number" min="1" max="30"
                  value={customBreak}
                  onChange={e => setCustomBreak(+e.target.value)}
                  placeholder="Break min"
                />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {onBack && (
            <button className={styles.backBtn} onClick={onBack}>
              <svg viewBox="0 0 14 14"><polyline points="9,2 5,7 9,12"/></svg>
            </button>
          )}
          <div className={styles.headerTitle}>Study</div>
        </div>
        <div className={styles.streakPill}>
          <svg viewBox="0 0 12 12"><path d="M6 1c0 3-4 4-4 7a4 4 0 008 0c0-3-4-4-4-7z"/></svg>
          {store.streak} day{store.streak !== 1 ? 's' : ''}
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.leftCol}>{LeftCol}</div>
        <div className={styles.rightCol}>{RightCol}</div>
      </div>
    </div>
  );
}
