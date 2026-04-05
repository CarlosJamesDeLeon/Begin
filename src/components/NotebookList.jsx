import React, { useState } from 'react';

const NotebookList = ({ store, navigate }) => {
  const [showModal, setShowModal] = useState(false);
  const [notebookName, setNotebookName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6B7FD4');

  const colors = ['#6B7FD4', '#5DAA88', '#D4956B', '#C47DB8', '#D4736B', '#7BAFD4'];

  const handleCreate = () => {
    if (!notebookName.trim()) return;
    store.saveNotebook({
      id: store.uid(),
      name: notebookName,
      color: selectedColor,
      createdAt: Date.now(),
    });
    setNotebookName('');
    setShowModal(false);
  };

  return (
    <div id="view-notebooks" className="view active">
      <header className="view-header">
        <button className="back-btn" onClick={() => navigate('dashboard')}>
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9,2 5,7 9,12" />
          </svg>
        </button>
        <div className="view-header-title">Notes</div>
      </header>

      <div className="view-body">
        <button className="add-dashed-btn" onClick={() => setShowModal(true)}>
          <span className="add-icon-wrap">
            <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <line x1="6" y1="1" x2="6" y2="11" /><line x1="1" y1="6" x2="11" y2="6" />
            </svg>
          </span>
          New notebook…
        </button>

        <div className="section-label">Your notebooks</div>
        <div className="notebook-list">
          {store.notebooks.length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: '13px', padding: '8px 0' }}>No notebooks yet. Create one above.</p>
          ) : (
            store.notebooks.map(nb => {
              const count = store.notes.filter(n => n.notebookId === nb.id).length;
              return (
                <div key={nb.id} className="notebook-item" onClick={() => navigate('note-list', { notebookId: nb.id })}>
                  <span className="nb-color-dot" style={{ background: nb.color }}></span>
                  <div className="nb-info">
                    <div className="nb-name">{nb.name}</div>
                    <div className="nb-count">{count} {count === 1 ? 'note' : 'notes'}</div>
                  </div>
                  <div className="nb-actions">
                    <button 
                      className="nb-delete-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        store.deleteNotebook(nb.id);
                      }}
                      title="Delete notebook"
                      style={{ position: 'relative', zIndex: 10 }}
                    >
                      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2,3.5 12,3.5" />
                        <path d="M4.5,3.5V2.5a.5.5,0,0,1,.5-.5h4a.5.5,0,0,1,.5.5v1" />
                        <rect x="3" y="4.5" width="8" height="8" rx="1" />
                      </svg>
                    </button>
                    <svg className="nb-chevron" viewBox="0 0 14 14">
                      <polyline points="5,3 9,7 5,11" />
                    </svg>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">New notebook</div>
            <input 
              type="text" 
              className="modal-input" 
              placeholder="e.g. Physics" 
              value={notebookName}
              onChange={(e) => setNotebookName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="modal-color-row">
              <span className="modal-label">Color</span>
              <div className="color-options">
                {colors.map(color => (
                  <button 
                    key={color}
                    className={`color-opt ${selectedColor === color ? 'selected' : ''}`}
                    style={{ background: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="modal-confirm" onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotebookList;
