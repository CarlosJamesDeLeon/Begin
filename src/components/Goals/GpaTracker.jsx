import React, { useState, useMemo } from 'react';
import styles from './Goals.module.css';
import { usePrefsStore } from '../Preferences/usePrefsStore';

const GRADE_POINTS = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'F': 0.0,
};

// Philippine — 1.0 = Excellent (UP, DLSU style)
const PH_1_GRADE_POINTS = {
  '1.00': 1.00, '1.25': 1.25, '1.50': 1.50, '1.75': 1.75,
  '2.00': 2.00, '2.25': 2.25, '2.50': 2.50, '2.75': 2.75,
  '3.00': 3.00, '4.00': 4.00, '5.00': 5.00,
};

// Philippine — 5.0 = Excellent (CITU, Ateneo style)
const PH_5_GRADE_POINTS = {
  '5.00': 5.00, '4.75': 4.75, '4.50': 4.50, '4.25': 4.25,
  '4.00': 4.00, '3.75': 3.75, '3.50': 3.50, '3.25': 3.25,
  '3.00': 3.00, '2.00': 2.00, '1.00': 1.00,
};

function gradeColor(grade, scale) {
  if (scale === 'philippine-5') {
    const pts = PH_5_GRADE_POINTS[grade] ?? 3.0;
    if (pts >= 4.5) return { color: '#5DAA88', bg: 'rgba(93,170,136,0.12)' };
    if (pts >= 3.5) return { color: '#6B7FD4', bg: 'rgba(107,127,212,0.12)' };
    if (pts >= 3.0) return { color: '#E2A95B', bg: 'rgba(226,169,91,0.12)' };
    return { color: '#E05858', bg: 'rgba(224,88,88,0.12)' };
  }
  if (scale === 'philippine-1') {
    const pts = PH_1_GRADE_POINTS[grade] ?? 3.0;
    if (pts <= 1.25) return { color: '#5DAA88', bg: 'rgba(93,170,136,0.12)' };
    if (pts <= 1.75) return { color: '#6B7FD4', bg: 'rgba(107,127,212,0.12)' };
    if (pts <= 3.00) return { color: '#E2A95B', bg: 'rgba(226,169,91,0.12)' };
    return { color: '#E05858', bg: 'rgba(224,88,88,0.12)' };
  }
  const pts = GRADE_POINTS[grade] ?? 0;
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
    if (gpa <= 1.25) return '#5DAA88';
    if (gpa <= 1.75) return '#6B7FD4';
    if (gpa <= 3.00) return '#E2A95B';
    return '#E05858';
  }
  if (gpa >= 3.7) return '#5DAA88';
  if (gpa >= 3.0) return '#6B7FD4';
  if (gpa >= 2.0) return '#E2A95B';
  return '#E05858';
}

function gpaLabel(gpa, scale) {
  if (scale === 'philippine-5') {
    if (gpa === 0)   return 'No courses yet';
    if (gpa >= 4.75) return 'Excellent';
    if (gpa >= 4.0)  return 'Very Good';
    if (gpa >= 3.5)  return 'Good';
    if (gpa >= 3.0)  return 'Passing';
    return 'Failed';
  }
  if (scale === 'philippine-1') {
    if (gpa === 0)   return 'No courses yet';
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
  return 'No courses yet';
}

export default function GpaTracker({ store }) {
  const prefs = usePrefsStore();
  const scale  = prefs.gpaScale || '4.0';
  const isPH   = scale === 'philippine-1' || scale === 'philippine-5';
  const GRADES = scale === 'philippine-1' ? PH_1_GRADE_POINTS
               : scale === 'philippine-5' ? PH_5_GRADE_POINTS
               : GRADE_POINTS;
  const defaultGrade = scale === 'philippine-1' ? '1.00' : scale === 'philippine-5' ? '5.00' : 'A';
  const [name, setName]       = useState('');
  const [units, setUnits] = useState('');
  const [grade, setGrade]     = useState(defaultGrade);
  const [semester, setSemester] = useState('');
  const [targetGpa, setTargetGpa]         = useState('');
  const [futureUnits, setFutureUnits] = useState('');
  const [whatIfResult, setWhatIfResult]   = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name || !units) return;
    store.addCourse({ name: name.trim(), units: parseFloat(units), grade, semester: semester.trim() });
    setName(''); setUnits(''); setGrade(defaultGrade); setSemester('');
    setShowForm(false);
  };

  const { gpa, totalUnits, totalPoints } = useMemo(() => {
    let pts = 0, unitsSum = 0;
    store.courses.forEach(c => {
      pts  += (GRADES[c.grade] ?? 0) * (c.units || c.credits || 0);
      unitsSum += (c.units || c.credits || 0);
    });
    return { gpa: unitsSum > 0 ? pts / unitsSum : 0, totalUnits: unitsSum, totalPoints: pts };
  }, [store.courses, scale]);

  // Group courses by semester
  const bySemester = useMemo(() => {
    const map = {};
    store.courses.forEach(c => {
      const sem = c.semester || 'Unsorted';
      if (!map[sem]) map[sem] = [];
      map[sem].push(c);
    });
    return map;
  }, [store.courses]);

  const calcWhatIf = () => {
    const tgt = parseFloat(targetGpa);
    const fut = parseFloat(futureUnits);
    if (!tgt || !fut) return;
    if (isPH && (tgt < 1.0 || tgt > 5.0)) return;
    if (!isPH && (tgt < 0 || tgt > 4.0)) return;
    const neededTotal  = tgt * (totalUnits + fut);
    const neededFuture = neededTotal - totalPoints;
    const avg          = neededFuture / fut;
    let letter;
    if (scale === 'philippine-5') {
      letter = avg >= 4.75 ? '5.00 (Excellent)' : avg >= 4.0 ? '4.00–4.75 (Very Good)' : avg >= 3.5 ? '3.50–4.00 (Good)' : avg >= 3.0 ? '3.00 (Passing)' : 'Below 3.00 (Fail)';
    } else if (scale === 'philippine-1') {
      letter = avg <= 1.25 ? '1.00–1.25' : avg <= 1.75 ? '1.50–1.75' : avg <= 2.50 ? '2.00–2.50' : avg <= 3.00 ? '3.00' : 'Below 3.00 (Fail)';
    } else {
      letter = avg >= 4.0 ? 'A (4.0 max)' : avg >= 3.7 ? 'A-' : avg >= 3.3 ? 'B+' : avg >= 3.0 ? 'B' : avg >= 2.7 ? 'B-' : avg >= 2.0 ? 'C' : 'D or below';
    }
    const feasible = isPH ? (avg >= 1.0 && avg <= 5.0) : (avg >= 0 && avg <= 4.0);
    setWhatIfResult({ avg: Math.min(isPH ? 5.0 : 4.0, Math.max(isPH ? 1.0 : 0, avg)).toFixed(2), letter, feasible });
  };

  const gpaNum  = parseFloat(gpa.toFixed(2));
  const ringPct = scale === 'philippine-5'
    ? Math.min(gpaNum / 5.0, 1)
    : scale === 'philippine-1'
    ? Math.max(0, Math.min(1, (3.0 - gpaNum) / 2.0))
    : Math.min(gpaNum / 4.0, 1);
  const R = 70, CIRC = 2 * Math.PI * R;
  const color = gpaColor(gpaNum, scale);

  return (
    <div className={styles.gpaWrap}>
      {/* ── GPA Hero ── */}
      <div className={styles.gpaHeroCard}>
        <div className={styles.gpaRingWrap}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r={R} fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle
              cx="90" cy="90" r={R}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - ringPct)}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '90px 90px', transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s' }}
            />
          </svg>
          <div className={styles.gpaRingCenter}>
            <div className={styles.gpaRingVal} style={{ color }}>{gpaNum.toFixed(2)}</div>
            <div className={styles.gpaRingLbl}>GPA</div>
          </div>
        </div>
        <div className={styles.gpaHeroInfo}>
          <div className={styles.gpaHeroStanding} style={{ color }}>{gpaLabel(gpaNum, scale)}</div>
          <div className={styles.gpaHeroStats}>
            <div className={styles.gpaHeroStat}>
              <span className={styles.gpaHeroStatVal}>{store.courses.length}</span>
              <span className={styles.gpaHeroStatLbl}>Courses</span>
            </div>
            <div className={styles.gpaHeroStatDiv} />
            <div className={styles.gpaHeroStat}>
              <span className={styles.gpaHeroStatVal}>{totalUnits}</span>
              <span className={styles.gpaHeroStatLbl}>Units</span>
            </div>
            <div className={styles.gpaHeroStatDiv} />
            <div className={styles.gpaHeroStat}>
              <span className={styles.gpaHeroStatVal}>{Object.keys(bySemester).length}</span>
              <span className={styles.gpaHeroStatLbl}>Semesters</span>
            </div>
          </div>
          <div className={styles.gpaScaleBar}>
            {scale === 'philippine-5'
              ? [['1', '#E05858'], ['2', '#E2A95B'], ['3', '#6B7FD4'], ['5', '#5DAA88']].map(([l, c]) => (
                  <div key={l} className={styles.gpaScaleSegment} style={{ background: c + '33' }}>
                    <span style={{ color: c, fontWeight: 600 }}>{l}</span>
                  </div>
                ))
              : scale === 'philippine-1'
              ? [['5', '#E05858'], ['3', '#E2A95B'], ['2', '#6B7FD4'], ['1', '#5DAA88']].map(([l, c]) => (
                  <div key={l} className={styles.gpaScaleSegment} style={{ background: c + '33' }}>
                    <span style={{ color: c, fontWeight: 600 }}>{l}</span>
                  </div>
                ))
              : [['D', '#E05858'], ['C', '#E2A95B'], ['B', '#6B7FD4'], ['A', '#5DAA88']].map(([l, c]) => (
                  <div key={l} className={styles.gpaScaleSegment} style={{ background: c + '33' }}>
                    <span style={{ color: c, fontWeight: 600 }}>{l}</span>
                  </div>
                ))
            }
            <div className={styles.gpaScaleMarker} style={{ left: `${ringPct * 100}%`, background: color }} />
          </div>
        </div>
      </div>

      <div className={styles.gpaTwoCols}>
        {/* ── Left: Course list ── */}
        <div className={styles.gpaLeft}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Courses</div>
            <button className={styles.addTaskBtn} onClick={() => setShowForm(s => !s)}>
              {showForm ? '✕ Cancel' : '+ Add Course'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAdd} className={styles.addForm}>
              <input className={styles.addFormInput} placeholder="Course Name (e.g. Calculus I)" value={name} onChange={e => setName(e.target.value)} autoFocus />
              <div className={styles.addFormRow}>
                <input className={styles.addFormInput} placeholder="Semester (e.g. 1st Sem AY24)" value={semester} onChange={e => setSemester(e.target.value)} />
                <input className={styles.addFormInput} type="number" placeholder="Units" value={units} onChange={e => setUnits(e.target.value)} min="0" step="0.5" />
                <select className={styles.addFormInput} value={grade} onChange={e => setGrade(e.target.value)}>
                  {Object.keys(GRADES).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <button type="submit" className={styles.addFormSubmit} disabled={!name || !credits}>Add Course</button>
            </form>
          )}

          {store.courses.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📚</div>
              <div className={styles.emptyTitle}>No courses yet</div>
              <div className={styles.emptyDesc}>Add your first course to start tracking your GPA.</div>
            </div>
          ) : (
            Object.entries(bySemester).map(([sem, courses]) => (
              <div key={sem} className={styles.semesterGroup}>
                <div className={styles.semesterLabel}>{sem}</div>
                {courses.map(course => {
                  const gClr = gradeColor(course.grade, isPH);
                  const pts  = GRADES[course.grade] ?? 0;
                  const barPct = isPH
                    ? Math.max(0, (3.0 - pts) / 2.0) * 100
                    : (pts / 4.0) * 100;
                  return (
                    <div key={course.id} className={styles.courseItem}>
                      <div className={styles.courseBarWrap}>
                        <div className={styles.courseBar} style={{ width: `${barPct}%`, background: gClr.color + '55' }} />
                      </div>
                      <div className={styles.courseInfo}>
                        <div className={styles.courseName}>{course.name}</div>
                        <div className={styles.courseMeta}>{course.semester} · {course.units} Units</div>
                      </div>
                      <div className={styles.courseGrade} style={{ color: gClr.color, background: gClr.bg }}>{course.grade}</div>
                      <div className={styles.coursePoints} style={{ color: 'var(--text-3)' }}>{pts.toFixed(1)}</div>
                      <button className={styles.taskDelete} onClick={() => store.deleteCourse(course.id)} aria-label="Delete course">
                        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="10.5" y1="3.5" x2="3.5" y2="10.5" /><line x1="3.5" y1="3.5" x2="10.5" y2="10.5" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* ── Right: What-If Calculator ── */}
        <div className={styles.gpaRight}>
          <div className={styles.sectionTitle}>What-If Calculator</div>
          <p className={styles.whatIfDesc}>Estimate what grades you need in future courses to hit a target GPA.</p>
          <div className={styles.whatIfForm}>
            <div className={styles.whatIfField}>
              <label className={styles.whatIfLabel}>Target GPA</label>
              <input className={styles.addFormInput} type="number" placeholder="e.g. 3.8" step="0.01" min="0" max="4.0" value={targetGpa} onChange={e => setTargetGpa(e.target.value)} />
            </div>
            <div className={styles.calcField}>
              <div className={styles.calcLabel}>Future Units</div>
              <input type="number" className={styles.calcInput} placeholder="Units" value={futureUnits} onChange={e => setFutureUnits(e.target.value)} />
            </div>
            <button className={styles.addFormSubmit} onClick={calcWhatIf} disabled={!targetGpa || !futureUnits}>Calculate</button>
          </div>
          {whatIfResult && (
            <div className={`${styles.whatIfResult} ${whatIfResult.feasible ? styles.whatIfOk : styles.whatIfWarn}`}>
              {whatIfResult.feasible ? (
                <>
                  <div className={styles.whatIfResultTitle}>You need to average</div>
                  <div className={styles.whatIfResultGpa}>{whatIfResult.avg}</div>
                  <div className={styles.whatIfResultGrade}>≈ {whatIfResult.letter} per course</div>
                  <div className={styles.whatIfResultNote}>in your next {futureUnits} units to reach a {parseFloat(targetGpa).toFixed(2)} GPA.</div>
                </>
              ) : (
                <div className={styles.whatIfResultContent}>
                  <div className={styles.whatIfResultTitle}>Not Feasible</div>
                  <div className={styles.whatIfResultNote}>This target requires more than the maximum grade points — mathematically impossible with {futureUnits} future units.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
