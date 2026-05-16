import React, { useState, useEffect, useMemo } from 'react';
import styles from './Goals.module.css';
import { usePrefsStore } from '../Preferences/usePrefsStore';

// ── US letter grade table ──────────────────────────────────────
const GRADE_POINTS = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'F': 0.0,
};

function getGradeValue(grade, scale) {
  if (!grade) return null;
  if (scale === 'philippine-1' || scale === 'philippine-5') {
    const n = parseFloat(grade);
    return isNaN(n) ? null : n;
  }
  const upper = grade.trim().toUpperCase();
  const match = Object.keys(GRADE_POINTS).find(k => k.toUpperCase() === upper);
  return match !== undefined ? GRADE_POINTS[match] : null;
}

function isValidGrade(grade, scale) {
  if (!grade || !grade.trim()) return false;
  if (scale === 'philippine-1' || scale === 'philippine-5') {
    const n = parseFloat(grade.trim());
    return !isNaN(n) && n >= 1.0 && n <= 5.0;
  }
  const upper = grade.trim().toUpperCase();
  return Object.keys(GRADE_POINTS).some(k => k.toUpperCase() === upper);
}

function normaliseGrade(grade, scale) {
  if (!grade || !grade.trim()) return '';
  if (scale === 'philippine-1' || scale === 'philippine-5') {
    const n = parseFloat(grade.trim());
    return isNaN(n) ? grade : n.toFixed(2);
  }
  const upper = grade.trim().toUpperCase();
  return Object.keys(GRADE_POINTS).find(k => k.toUpperCase() === upper) || grade;
}

function gradeColor(grade, scale) {
  const pts = getGradeValue(grade, scale);
  if (pts === null) return { color: 'var(--text-3)', bg: 'transparent' };
  if (scale === 'philippine-5') {
    if (pts >= 4.5) return { color: '#5DAA88', bg: 'rgba(93,170,136,0.12)' };
    if (pts >= 3.5) return { color: '#6B7FD4', bg: 'rgba(107,127,212,0.12)' };
    if (pts >= 3.0) return { color: '#E2A95B', bg: 'rgba(226,169,91,0.12)' };
    return { color: '#E05858', bg: 'rgba(224,88,88,0.12)' };
  }
  if (scale === 'philippine-1') {
    if (pts <= 1.5) return { color: '#5DAA88', bg: 'rgba(93,170,136,0.12)' };
    if (pts <= 2.0) return { color: '#6B7FD4', bg: 'rgba(107,127,212,0.12)' };
    if (pts <= 3.0) return { color: '#E2A95B', bg: 'rgba(226,169,91,0.12)' };
    return { color: '#E05858', bg: 'rgba(224,88,88,0.12)' };
  }
  if (pts >= 3.7) return { color: '#5DAA88', bg: 'rgba(93,170,136,0.12)' };
  if (pts >= 3.0) return { color: '#6B7FD4', bg: 'rgba(107,127,212,0.12)' };
  if (pts >= 2.0) return { color: '#E2A95B', bg: 'rgba(226,169,91,0.12)' };
  return { color: '#E05858', bg: 'rgba(224,88,88,0.12)' };
}

function gpaColor(gpa, scale) {
  if (scale === 'philippine-5') {
    if (gpa >= 4.5) return '#5DAA88';
    if (gpa >= 3.5) return '#6B7FD4';
    if (gpa >= 3.0) return '#E2A95B';
    return '#E05858';
  }
  if (scale === 'philippine-1') {
    if (gpa <= 1.5) return '#5DAA88';
    if (gpa <= 2.0) return '#6B7FD4';
    if (gpa <= 3.0) return '#E2A95B';
    return '#E05858';
  }
  if (gpa >= 3.7) return '#5DAA88';
  if (gpa >= 3.0) return '#6B7FD4';
  if (gpa >= 2.0) return '#E2A95B';
  return '#E05858';
}

function gpaLabel(gpa, scale) {
  if (scale === 'philippine-5') {
    if (gpa === 0)   return 'Add grades below';
    if (gpa >= 4.75) return 'Excellent';
    if (gpa >= 4.0)  return 'Very Good';
    if (gpa >= 3.5)  return 'Good';
    if (gpa >= 3.0)  return 'Passing';
    return 'Failed';
  }
  if (scale === 'philippine-1') {
    if (gpa === 0)   return 'Add grades below';
    if (gpa <= 1.25) return 'Summa Cum Laude';
    if (gpa <= 1.50) return 'Magna Cum Laude';
    if (gpa <= 1.75) return 'Cum Laude';
    if (gpa <= 3.00) return 'Satisfactory';
    return 'Failed';
  }
  if (gpa >= 3.7) return 'Summa Cum Laude';
  if (gpa >= 3.5) return 'Magna Cum Laude';
  if (gpa >= 3.0) return 'Cum Laude';
  if (gpa >= 2.0) return 'Satisfactory';
  if (gpa > 0)    return 'Needs Improvement';
  return 'Add grades below';
}

// ── Main component ────────────────────────────────────────────
export default function GpaTracker({ store }) {
  const prefs = usePrefsStore();
  const scale  = prefs.gpaScale || '4.0';
  const isPH   = scale === 'philippine-1' || scale === 'philippine-5';

  // What-if state
  const [targetGpa, setTargetGpa]     = useState('');
  const [futureUnits, setFutureUnits] = useState('');
  const [whatIfResult, setWhatIfResult] = useState(null);

  // ── Computed GWA (only from rows that have a valid grade) ──
  const { gwa, totalUnits, totalPoints, gradedCount } = useMemo(() => {
    let pts = 0, u = 0, count = 0;
    store.courses.forEach(c => {
      const val = getGradeValue(c.grade, scale);
      if (val !== null) {
        pts += val * (c.units || 3);
        u   += (c.units || 3);
        count++;
      }
    });
    return { gwa: u > 0 ? pts / u : 0, totalUnits: u, totalPoints: pts, gradedCount: count };
  }, [store.courses, scale]);

  // ── Add a new empty subject ────────────────────────────────
  const addSubject = () => {
    const num = store.courses.length + 1;
    store.addCourse({ name: `Subject ${num}`, units: 3, grade: '' });
  };

  // ── What-if ───────────────────────────────────────────────
  const calcWhatIf = () => {
    const tgt = parseFloat(targetGpa);
    const fut = parseFloat(futureUnits);
    if (!tgt || !fut || fut <= 0) return;
    if (isPH  && (tgt < 1.0 || tgt > 5.0)) return;
    if (!isPH && (tgt < 0   || tgt > 4.0)) return;

    const neededFuture = tgt * (totalUnits + fut) - totalPoints;
    const avg = neededFuture / fut;

    let letter;
    if (scale === 'philippine-5') {
      letter = avg >= 4.75 ? '5.00 — Excellent'
             : avg >= 4.0  ? '4.00–4.75 — Very Good'
             : avg >= 3.5  ? '3.50–4.00 — Good'
             : avg >= 3.0  ? '3.00 — Passing'
             : 'Below 3.00 — Failing';
    } else if (scale === 'philippine-1') {
      letter = avg <= 1.5  ? 'Around 1.00–1.50 (Excellent)'
             : avg <= 2.0  ? 'Around 1.75–2.00 (Good)'
             : avg <= 3.0  ? 'Around 2.50–3.00 (Passing)'
             : 'Above 3.00 — Failing';
    } else {
      letter = avg >= 4.0 ? 'A (4.0)'
             : avg >= 3.7 ? 'A-'
             : avg >= 3.3 ? 'B+'
             : avg >= 3.0 ? 'B'
             : avg >= 2.7 ? 'B-'
             : avg >= 2.0 ? 'C'
             : 'D or below';
    }

    const feasible = isPH ? (avg >= 1.0 && avg <= 5.0) : (avg >= 0 && avg <= 4.0);
    setWhatIfResult({ avg: avg.toFixed(2), letter, feasible });
  };

  // ── Ring ─────────────────────────────────────────────────
  const gwaNum  = parseFloat(gwa.toFixed(2));
  const ringPct = scale === 'philippine-5'
    ? Math.min(gwaNum / 5.0, 1)
    : scale === 'philippine-1'
    ? Math.max(0, Math.min(1, (5.0 - gwaNum) / 4.0))
    : Math.min(gwaNum / 4.0, 1);
  const R = 70, CIRC = 2 * Math.PI * R;
  const color = gpaColor(gwaNum, scale);

  const scaleLabel = scale === 'philippine-5' ? 'PH 5.0 Scale'
                   : scale === 'philippine-1'  ? 'PH 1.0 Scale'
                   : '4.0 US Scale';
  const maxLabel   = scale === 'philippine-5' ? '5.00'
                   : scale === 'philippine-1'  ? '1.00'
                   : '4.00';
  const gradePlaceholder = isPH ? `e.g. 2.5` : `e.g. A-`;

  return (
    <div className={styles.gpaWrap}>

      {/* ── Hero card ── */}
      <div className={styles.gpaHeroCard}>
        <div className={styles.gpaRingWrap}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r={R} fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle
              cx="90" cy="90" r={R}
              fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - ringPct)}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '90px 90px', transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s' }}
            />
          </svg>
          <div className={styles.gpaRingCenter}>
            <div className={styles.gpaRingVal} style={{ color }}>{gradedCount > 0 ? gwaNum.toFixed(2) : '—'}</div>
            <div className={styles.gpaRingLbl}>GWA</div>
          </div>
        </div>

        <div className={styles.gpaHeroInfo}>
          <div className={styles.gpaHeroStanding} style={{ color }}>{gpaLabel(gwaNum, scale)}</div>
          <div className={styles.gpaHeroStats}>
            <div className={styles.gpaHeroStat}>
              <span className={styles.gpaHeroStatVal}>{store.courses.length}</span>
              <span className={styles.gpaHeroStatLbl}>Subjects</span>
            </div>
            <div className={styles.gpaHeroStatDiv} />
            <div className={styles.gpaHeroStat}>
              <span className={styles.gpaHeroStatVal}>{gradedCount > 0 ? totalUnits : '—'}</span>
              <span className={styles.gpaHeroStatLbl}>Units Graded</span>
            </div>
          </div>
          <div className={styles.gpaScalePill}>{scaleLabel} · Best: {maxLabel}</div>
          <div className={styles.gpaScaleBar}>
            {(() => {
              const segs = scale === 'philippine-5'
                ? [['Fail','#E05858'],['Pass','#E2A95B'],['Good','#6B7FD4'],['Excellent','#5DAA88']]
                : scale === 'philippine-1'
                ? [['Fail','#E05858'],['Pass','#E2A95B'],['CL','#6B7FD4'],['SCL','#5DAA88']]
                : [['D/F','#E05858'],['C','#E2A95B'],['B','#6B7FD4'],['A','#5DAA88']];
              return segs.map(([l, c]) => (
                <div key={l} className={styles.gpaScaleSegment} style={{ background: c + '22' }}>
                  <span style={{ color: c, fontWeight: 600, fontSize: 10 }}>{l}</span>
                </div>
              ));
            })()}
            {gradedCount > 0 && (
              <div className={styles.gpaScaleMarker} style={{ left: `${ringPct * 100}%`, background: color }} />
            )}
          </div>
        </div>
      </div>

      <div className={styles.gpaTwoCols}>
        {/* ── Left: Spreadsheet-style subject table ── */}
        <div className={styles.gpaLeft}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>My Subjects</div>
            <button className={styles.addTaskBtn} onClick={addSubject}>
              + Add Subject
            </button>
          </div>


          {/* Column headers */}
          <div className={styles.gpaTableHead}>
            <span className={styles.gpaThNum}>#</span>
            <span className={styles.gpaThName}>Subject Name</span>
            <span className={styles.gpaThUnits}>Units</span>
            <span className={styles.gpaThGrade}>Grade</span>
            <span className={styles.gpaThAction} />
          </div>

          {/* Subject rows */}
          <div className={styles.gpaSubjectList}>
            {store.courses.map((course, i) => {
              const valid = isValidGrade(course.grade, scale);
              const gClr  = valid ? gradeColor(course.grade, scale) : { color: 'var(--text-3)', bg: 'transparent' };
              return (
                <SubjectRow
                  key={course.id}
                  course={course}
                  index={i}
                  scale={scale}
                  valid={valid}
                  gClr={gClr}
                  gradePlaceholder={gradePlaceholder}
                  onUpdate={(updates) => store.updateCourse(course.id, updates)}
                  onDelete={() => store.deleteCourse(course.id)}
                />
              );
            })}
          </div>

          <button className={styles.gpaAddRowBtn} onClick={addSubject}>
            + Add Subject {store.courses.length + 1}
          </button>
        </div>

        {/* ── Right: Target calculator ── */}
        <div className={styles.gpaRight}>
          <div className={styles.gpaCalcTitle}>🎯 Target Calculator</div>
          <p className={styles.whatIfDesc}>
            Want to hit a specific GWA? Enter your goal and the units you're taking next — we'll tell you what average you need.
          </p>

          <div className={styles.whatIfForm}>
            <div className={styles.whatIfField}>
              <label className={styles.whatIfLabel}>
                My Target GWA <span className={styles.gpaFormHint}>(best: {maxLabel})</span>
              </label>
              <input
                className={styles.gpaFormInput}
                type="number"
                placeholder={isPH ? (scale === 'philippine-1' ? 'e.g. 1.50' : 'e.g. 4.50') : 'e.g. 3.80'}
                step="0.01"
                min={isPH ? '1' : '0'}
                max={isPH ? '5' : '4'}
                value={targetGpa}
                onChange={e => { setTargetGpa(e.target.value); setWhatIfResult(null); }}
              />
            </div>
            <div className={styles.whatIfField}>
              <label className={styles.whatIfLabel}>
                Units next semester <span className={styles.gpaFormHint}>(total units)</span>
              </label>
              <input
                className={styles.gpaFormInput}
                type="number"
                placeholder="e.g. 21"
                step="0.5" min="0.5"
                value={futureUnits}
                onChange={e => { setFutureUnits(e.target.value); setWhatIfResult(null); }}
              />
            </div>
            <button className={styles.gpaCalcBtn} onClick={calcWhatIf} disabled={!targetGpa || !futureUnits || gradedCount === 0}>
              Calculate
            </button>
            {gradedCount === 0 && <div className={styles.gpaFormHint} style={{ textAlign: 'center', marginTop: 4 }}>Add at least one grade first</div>}
          </div>

          {whatIfResult && (
            <div className={`${styles.whatIfResult} ${whatIfResult.feasible ? styles.whatIfOk : styles.whatIfWarn}`}>
              {whatIfResult.feasible ? (
                <>
                  <div className={styles.whatIfResultTitle}>You need to average</div>
                  <div className={styles.whatIfResultGpa} style={{ color }}>{whatIfResult.avg}</div>
                  <div className={styles.whatIfResultGrade}>{whatIfResult.letter}</div>
                  <div className={styles.whatIfResultNote}>
                    across your next {futureUnits} units to reach a <strong>{parseFloat(targetGpa).toFixed(2)}</strong> GWA.
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.whatIfResultTitle} style={{ color: '#E05858' }}>Not Achievable</div>
                  <div className={styles.whatIfResultNote}>
                    Even with the best grade in all {futureUnits} units, you can't reach <strong>{parseFloat(targetGpa).toFixed(2)}</strong> from your current GWA. Try adjusting your target or adding more units.
                  </div>
                </>
              )}
            </div>
          )}

          {gradedCount > 0 && !whatIfResult && (
            <div className={styles.gpaCalcHint}>
              <span>📊</span>
              <span>Current GWA: <strong style={{ color }}>{gwaNum.toFixed(2)}</strong> — {gpaLabel(gwaNum, scale)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Inline editable subject row ────────────────────────────────
function SubjectRow({ course, index, scale, valid, gClr, gradePlaceholder, onUpdate, onDelete }) {
  const [localName,  setLocalName]  = useState(course.name  || '');
  const [localUnits, setLocalUnits] = useState(String(course.units || 3));
  const [localGrade, setLocalGrade] = useState(course.grade || '');
  const [gradeErr,   setGradeErr]   = useState(false);

  // Keep local in sync if store changes externally
  useEffect(() => { setLocalName(course.name  || ''); }, [course.name]);
  useEffect(() => { setLocalUnits(String(course.units || 3)); }, [course.units]);
  useEffect(() => { setLocalGrade(course.grade || ''); }, [course.grade]);

  const commitGrade = () => {
    if (!localGrade.trim()) { onUpdate({ grade: '' }); setGradeErr(false); return; }
    if (isValidGrade(localGrade, scale)) {
      onUpdate({ grade: normaliseGrade(localGrade, scale) });
      setGradeErr(false);
    } else {
      setGradeErr(true);
    }
  };

  return (
    <div className={`${styles.gpaTableRow} ${valid ? styles.gpaRowGraded : ''}`}>
      {valid && (
        <div className={styles.courseBarWrap}>
          <div className={styles.courseBar} style={{
            width: (() => {
              const pts = valid ? (getGradeValue(course.grade, scale) ?? 0) : 0;
              return scale === 'philippine-1'
                ? `${Math.max(0, (5.0 - pts) / 4.0) * 100}%`
                : scale === 'philippine-5'
                ? `${(pts / 5.0) * 100}%`
                : `${(pts / 4.0) * 100}%`;
            })(),
            background: gClr.color + '22'
          }} />
        </div>
      )}

      <span className={styles.gpaRowNum}>{index + 1}</span>

      <input
        className={styles.gpaRowName}
        value={localName}
        placeholder={`Subject ${index + 1}`}
        onChange={e => setLocalName(e.target.value)}
        onBlur={() => onUpdate({ name: localName.trim() || `Subject ${index + 1}` })}
      />

      <input
        className={styles.gpaRowUnits}
        type="number"
        value={localUnits}
        min="0.5" max="12" step="0.5"
        onChange={e => setLocalUnits(e.target.value)}
        onBlur={() => onUpdate({ units: parseFloat(localUnits) || 3 })}
        title="Units"
      />

      <div className={styles.gpaRowGradeWrap}>
        <input
          className={`${styles.gpaRowGrade} ${gradeErr ? styles.gpaRowGradeErr : ''} ${valid ? styles.gpaRowGradeValid : ''}`}
          style={valid ? { color: gClr.color, fontWeight: 700 } : {}}
          value={localGrade}
          placeholder={gradePlaceholder}
          onChange={e => { setLocalGrade(e.target.value); setGradeErr(false); }}
          onBlur={commitGrade}
          onKeyDown={e => e.key === 'Enter' && e.target.blur()}
          title={`Enter grade${scale !== '4.0' ? ' (1.0–5.0)' : ' (A, B+, etc.)'}`}
        />
        {gradeErr && <div className={styles.gpaRowGradeErrTip}>{scale !== '4.0' ? '1.0–5.0' : 'A, B+…'}</div>}
      </div>

      <button className={styles.taskDelete} onClick={onDelete} aria-label="Remove subject">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="10.5" y1="3.5" x2="3.5" y2="10.5" /><line x1="3.5" y1="3.5" x2="10.5" y2="10.5" />
        </svg>
      </button>
    </div>
  );
}


