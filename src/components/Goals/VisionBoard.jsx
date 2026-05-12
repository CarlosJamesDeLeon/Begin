import React, { useState, useRef } from 'react';
import styles from './Goals.module.css';

export default function VisionBoard({ store }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    store.addVisionGoal({ title, desc, imageBase64 });
    setTitle('');
    setDesc('');
    setImageBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Add Long-Term Goal</div>
        <form onSubmit={handleAdd} className={styles.inputGroup}>
          <input 
            className={styles.input} 
            placeholder="Goal Title (e.g. Learn a New Language)" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
          />
          <textarea 
            className={styles.input} 
            placeholder="Description (Optional)" 
            value={desc} 
            onChange={e => setDesc(e.target.value)}
            rows="3"
            style={{ resize: 'vertical' }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
            <button 
              type="button"
              className={styles.btn} 
              style={{ background: 'var(--bg-off)', color: 'var(--text-1)', border: '1px solid var(--border)' }}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Image
            </button>
            <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
              {imageBase64 ? 'Image selected' : 'No image selected'}
            </span>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </div>

          <button type="submit" className={styles.btn} style={{ marginTop: '8px' }} disabled={!title.trim()}>
            Add to Vision Board
          </button>
        </form>
      </div>

      <div className={styles.visionGrid}>
        {store.visionGoals.map(goal => (
          <div key={goal.id} className={styles.visionCard}>
            {goal.imageBase64 ? (
              <img src={goal.imageBase64} alt={goal.title} className={styles.visionImg} />
            ) : (
              <div className={styles.visionImgPlaceholder}>No Image</div>
            )}
            <div className={styles.visionContent}>
              <div className={styles.visionTitle}>{goal.title}</div>
              {goal.desc && <div className={styles.visionDesc}>{goal.desc}</div>}
              
              <div className={styles.visionFooter}>
                <select 
                  className={styles.input} 
                  style={{ padding: '4px 8px', fontSize: '11px', width: 'auto' }}
                  value={goal.status} 
                  onChange={e => store.updateVisionGoal(goal.id, { status: e.target.value })}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <button 
                  className={styles.deleteBtn}
                  onClick={() => store.deleteVisionGoal(goal.id)}
                >
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="10.5" y1="3.5" x2="3.5" y2="10.5"/>
                    <line x1="3.5" y1="3.5" x2="10.5" y2="10.5"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
