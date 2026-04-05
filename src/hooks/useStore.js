import { useState, useEffect } from 'react';

const KEYS = { notebooks: 'begin_notebooks', notes: 'begin_notes' };

const defaultNotebooks = [];

const defaultNotes = [];

export const useStore = () => {
  const [notebooks, setNotebooks] = useState(() => {
    const raw = localStorage.getItem(KEYS.notebooks);
    return raw ? JSON.parse(raw) : defaultNotebooks;
  });

  const [notes, setNotes] = useState(() => {
    const raw = localStorage.getItem(KEYS.notes);
    return raw ? JSON.parse(raw) : defaultNotes;
  });

  useEffect(() => {
    localStorage.setItem(KEYS.notebooks, JSON.stringify(notebooks));
  }, [notebooks]);

  useEffect(() => {
    localStorage.setItem(KEYS.notes, JSON.stringify(notes));
  }, [notes]);

  const saveNotebook = (nb) => {
    setNotebooks(prev => {
      const idx = prev.findIndex(n => n.id === nb.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = nb;
        return next;
      }
      return [nb, ...prev];
    });
  };

  const deleteNotebook = (id) => {
    setNotebooks(prev => prev.filter(n => n.id !== id));
    setNotes(prev => prev.filter(n => n.notebookId !== id));
  };

  const saveNote = (note) => {
    setNotes(prev => {
      const idx = prev.findIndex(n => n.id === note.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = note;
        return next;
      }
      return [note, ...prev];
    });
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const getRecent = (limit = 4) => {
    return [...notes]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit)
      .map(n => {
        const nb = notebooks.find(nb => nb.id === n.notebookId);
        return {
          type: 'note',
          id: n.id,
          notebookId: n.notebookId,
          name: n.title || 'Untitled',
          meta: nb ? nb.name : 'Notes',
          color: nb ? nb.color : '#6B7FD4',
          time: formatRelative(n.updatedAt),
        };
      });
  };

  const uid = () => '_' + Math.random().toString(36).slice(2, 10);

  const formatRelative = (ts) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'yesterday';
    return `${days}d ago`;
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return {
    notebooks, setNotebooks, saveNotebook, deleteNotebook,
    notes, setNotes, saveNote, deleteNote,
    getRecent, uid, formatDate
  };
};
