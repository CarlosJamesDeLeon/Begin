import React, { useState } from 'react';
import styles from './Goals.module.css';

const GRADE_POINTS = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'F': 0.0
};

export default function GpaTracker({ store }) {
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('');
  const [grade, setGrade] = useState('A');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name || !credits) return;
    store.addCourse({
      name,
      credits: parseFloat(credits),
      grade: grade.toUpperCase()
    });
    setName('');
    setCredits('');
    setGrade('A');
  };

  const calculateGPA = () => {
    if (store.courses.length === 0) return '0.00';
    let totalPoints = 0;
    let totalCredits = 0;
    
    store.courses.forEach(course => {
      const points = GRADE_POINTS[course.grade] || 0;
      totalPoints += points * course.credits;
      totalCredits += course.credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  return (
    <div>
      <div className={styles.gpaHero}>
        <div className={styles.gpaLabel}>Cumulative GPA</div>
        <div className={styles.gpaValue}>{calculateGPA()}</div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Add Course</div>
        <form onSubmit={handleAdd} className={styles.inputGroup}>
          <div className={styles.inputRow}>
            <input 
              className={styles.input} 
              placeholder="Course Name (e.g. Calculus I)" 
              value={name} 
              onChange={e => setName(e.target.value)}
              style={{ flex: 2 }}
            />
            <input 
              className={styles.input} 
              type="number"
              placeholder="Credits" 
              value={credits} 
              onChange={e => setCredits(e.target.value)}
              min="0"
              step="0.5"
            />
            <select 
              className={styles.input} 
              value={grade} 
              onChange={e => setGrade(e.target.value)}
            >
              {Object.keys(GRADE_POINTS).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <button type="submit" className={styles.btn} disabled={!name || !credits}>
            Add Course
          </button>
        </form>
      </div>

      {store.courses.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Your Courses</div>
          <div className={styles.courseList}>
            {store.courses.map(course => (
              <div key={course.id} className={styles.courseItem}>
                <div>
                  <div className={styles.courseName}>{course.name}</div>
                  <div className={styles.courseMeta}>{course.credits} Credits</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={styles.courseGrade}>{course.grade}</div>
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => store.deleteCourse(course.id)}
                  >
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="10.5" y1="3.5" x2="3.5" y2="10.5"/>
                      <line x1="3.5" y1="3.5" x2="10.5" y2="10.5"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Basic What-If Calculator */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>What-If Target</div>
        <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '12px', lineHeight: 1.5 }}>
          Enter a target GPA and total target credits to see what average grade points you need in future courses.
        </p>
        <div className={styles.inputGroup}>
          <div className={styles.inputRow}>
            <input className={styles.input} id="targetGpa" type="number" placeholder="Target GPA (e.g. 3.8)" step="0.01" min="0" max="4.0" />
            <input className={styles.input} id="futureCredits" type="number" placeholder="Future Credits (e.g. 15)" min="0" step="1" />
          </div>
          <button className={styles.btn} onClick={() => {
            const tgt = parseFloat(document.getElementById('targetGpa').value);
            const futCred = parseFloat(document.getElementById('futureCredits').value);
            if (!tgt || !futCred) return;
            
            let totalPoints = 0;
            let totalCredits = 0;
            store.courses.forEach(c => {
              totalPoints += (GRADE_POINTS[c.grade] || 0) * c.credits;
              totalCredits += c.credits;
            });
            
            const totalNeededPoints = tgt * (totalCredits + futCred);
            const neededFuturePoints = totalNeededPoints - totalPoints;
            const avgNeeded = neededFuturePoints / futCred;
            
            alert(`To reach a ${tgt.toFixed(2)} GPA, you need to average ${avgNeeded.toFixed(2)} grade points (approx ${avgNeeded >= 4.0 ? 'A' : avgNeeded >= 3.0 ? 'B' : avgNeeded >= 2.0 ? 'C' : 'D'}) in your next ${futCred} credits.`);
          }}>
            Calculate Required Average
          </button>
        </div>
      </div>
    </div>
  );
}
