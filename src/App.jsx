import { useState } from 'react';
import { useStore } from './hooks/useStore';
import { useFocusSync } from './hooks/useFocusSync';
import { useTheme } from './hooks/useTheme';
import Dashboard from './components/Dashboard';
import NotebookList from './components/NotebookList';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import Finance from './components/Finance';
import Study from './components/Study';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeNotebookId, setActiveNotebookId] = useState(null);
  const [activeNoteId, setActiveNoteId] = useState(null);

  const store = useStore();
  const { dark, toggle: toggleTheme } = useTheme();

  useFocusSync(currentView);

  const navigate = (viewId, params = {}) => {
    if (params.notebookId) setActiveNotebookId(params.notebookId);
    if (params.noteId) setActiveNoteId(params.noteId);
    setCurrentView(viewId);
  };

  return (
    <>
      {currentView === 'dashboard' && (
        <Dashboard
          store={store}
          navigate={navigate}
          dark={dark}
          toggleTheme={toggleTheme}
        />
      )}
      {currentView === 'notebooks' && (
        <NotebookList store={store} navigate={navigate} />
      )}
      {currentView === 'note-list' && (
        <NoteList store={store} navigate={navigate} notebookId={activeNotebookId} />
      )}
      {currentView === 'note-editor' && (
        <NoteEditor store={store} navigate={navigate} noteId={activeNoteId} />
      )}
      {currentView === 'finance' && (
        <Finance onBack={() => navigate('dashboard')} />
      )}
      {currentView === 'study' && (
        <Study onBack={() => navigate('dashboard')} />
      )}
    </>
  );
}

export default App;