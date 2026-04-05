import React from 'react';

const NoteList = ({ store, navigate, notebookId }) => {
  const nb = store.notebooks.find(n => n.id === notebookId);
  const notes = store.notes.filter(n => n.notebookId === notebookId).sort((a, b) => b.updatedAt - a.updatedAt);

  const handleAddNote = () => {
    const newNote = {
      id: store.uid(),
      notebookId,
      title: '',
      content: '',
      updatedAt: Date.now(),
    };
    store.saveNote(newNote);
    navigate('note-editor', { noteId: newNote.id });
  };

  return (
    <div id="view-note-list" className="view active">
      <header className="view-header">
        <button className="back-btn" onClick={() => navigate('notebooks')}>
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9,2 5,7 9,12" />
          </svg>
        </button>
        <div>
          <div className="view-header-title">{nb?.name || 'Notes'}</div>
          <div className="view-header-sub">{notes.length} notes</div>
        </div>
      </header>

      <div className="view-body">
        <button className="add-dashed-btn" onClick={handleAddNote}>
          <span className="add-icon-wrap">
            <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <line x1="6" y1="1" x2="6" y2="11" /><line x1="1" y1="6" x2="11" y2="6" />
            </svg>
          </span>
          Add a note…
        </button>

        <div className="section-label">Notes</div>
        <div className="note-list">
          {notes.length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: '13px', padding: '8px 0' }}>No notes yet. Add one above.</p>
          ) : (
            notes.map(n => (
              <div key={n.id} className="note-item" onClick={() => navigate('note-editor', { noteId: n.id })}>
                <div className="note-item-content">
                  <div className="note-item-title">{n.title || 'Untitled'}</div>
                  <div className="note-item-preview">{n.content}</div>
                  <div className="note-item-date">{store.formatDate(n.updatedAt)}</div>
                </div>
                <button 
                  className="note-delete-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    store.deleteNote(n.id);
                  }}
                  title="Delete note"
                  style={{ position: 'relative', zIndex: 10 }}
                >
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,3.5 12,3.5" />
                    <path d="M4.5,3.5V2.5a.5.5,0,0,1,.5-.5h4a.5.5,0,0,1,.5.5v1" />
                    <rect x="3" y="4.5" width="8" height="8" rx="1" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteList;
