import React, { useState, useEffect, useRef } from 'react';

const NoteEditor = ({ store, navigate, noteId }) => {
  const note = store.notes.find(n => n.id === noteId);
  const nb = store.notebooks.find(n => n.id === (note?.notebookId));

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [saveStatus, setSaveStatus] = useState('Saved');
  const timerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!note) return;
    setTitle(note.title);
    setContent(note.content);
  }, [noteId]);

  const handleAutoSave = () => {
    setSaveStatus('Saving…');
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      store.saveNote({
        ...note,
        title,
        content,
        updatedAt: Date.now(),
      });
      setSaveStatus('Saved');
    }, 800);
  };

  useEffect(() => {
    if (title !== note?.title || content !== note?.content) {
      handleAutoSave();
    }
  }, [title, content]);

  const handleDelete = () => {
    if (window.confirm('Delete this note?')) {
      store.deleteNote(noteId);
      navigate('note-list', { notebookId: note.notebookId });
    }
  };

  const formatText = (type) => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = ta.value.substring(start, end);

    const wrap = {
      bold: `**${sel || 'bold text'}**`,
      italic: `_${sel || 'italic text'}_`,
      list: `\n- ${sel || 'item'}`,
      check: `\n- [ ] ${sel || 'task'}`,
    };

    const replacement = wrap[type] || sel;
    const newContent = ta.value.substring(0, start) + replacement + ta.value.substring(end);
    setContent(newContent);
    
    // Focus back and set selection (roughly)
    setTimeout(() => {
      ta.focus();
      const newPos = start + replacement.length;
      ta.setSelectionRange(newPos, newPos);
    }, 0);
  };

  if (!note) return null;

  return (
    <div id="view-note-editor" className="view active">
      <header className="view-header editor-header">
        <button className="back-btn" onClick={() => navigate('note-list', { notebookId: note.notebookId })}>
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9,2 5,7 9,12" />
          </svg>
        </button>
        <div className="editor-notebook-pill">
          <span className="editor-pill-dot" style={{ background: nb?.color }}></span>
          <span>{nb?.name}</span>
        </div>
        <button className="editor-delete-btn" onClick={handleDelete} title="Delete note">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2,3.5 12,3.5" />
            <path d="M4.5,3.5V2.5a.5.5,0,0,1,.5-.5h4a.5.5,0,0,1,.5.5v1" />
            <rect x="3" y="4.5" width="8" height="8" rx="1" />
          </svg>
        </button>
      </header>

      <div className="editor-body">
        <input
          type="text"
          className="editor-title-input"
          placeholder="Untitled"
          autoComplete="off"
          spellCheck="false"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="editor-meta">
          {store.formatDate(note.updatedAt)} · {nb?.name}
        </div>
        <textarea
          ref={contentRef}
          className="editor-content-input"
          placeholder="Start writing…"
          spellCheck="true"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
      </div>

      <div className="editor-toolbar">
        <button className="toolbar-btn" title="Bold" onClick={() => formatText('bold')}>
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 3h4a2.5 2.5 0 010 5H4zM4 8h4.5a2.5 2.5 0 010 5H4z" />
          </svg>
        </button>
        <button className="toolbar-btn" title="Italic" onClick={() => formatText('italic')}>
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="3" x2="10" y2="3" /><line x1="4" y1="11" x2="9" y2="11" />
            <line x1="8" y1="3" x2="6" y2="11" />
          </svg>
        </button>
        <button className="toolbar-btn" title="List" onClick={() => formatText('list')}>
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="4" x2="12" y2="4" /><line x1="5" y1="7" x2="12" y2="7" /><line x1="5" y1="10" x2="12" y2="10" />
            <circle cx="2.5" cy="4" r="0.8" fill="currentColor" /><circle cx="2.5" cy="7" r="0.8" fill="currentColor" /><circle cx="2.5" cy="10" r="0.8" fill="currentColor" />
          </svg>
        </button>
        <div className="toolbar-sep"></div>
        <button className="toolbar-btn" title="Checklist" onClick={() => formatText('check')}>
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="10" height="10" rx="2" />
            <polyline points="4.5,7 6,8.5 9.5,5" />
          </svg>
        </button>
        <div className="toolbar-spacer"></div>
        <div className="editor-save-status">{saveStatus}</div>
      </div>
    </div>
  );
};

export default NoteEditor;
