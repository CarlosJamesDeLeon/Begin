import { useState, useEffect } from 'react';

const STORAGE_KEY = 'begin_goals';

const defaultState = {
  courses: [
    { id: '_default1', name: 'Subject 1', units: 3, grade: '', createdAt: 0 },
    { id: '_default2', name: 'Subject 2', units: 3, grade: '', createdAt: 0 },
    { id: '_default3', name: 'Subject 3', units: 3, grade: '', createdAt: 0 },
  ],
  tasks: [],
  visionGoals: [],
};

export function useGoalsStore() {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultState;
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const generateId = () => '_' + Math.random().toString(36).slice(2, 9);

  // --- GPA Tracker ---
  const addCourse = (course) => {
    setData(prev => ({
      ...prev,
      courses: [...(prev.courses || []), { ...course, id: generateId(), createdAt: Date.now() }]
    }));
  };

  const updateCourse = (id, updates) => {
    setData(prev => ({
      ...prev,
      courses: (prev.courses || []).map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const deleteCourse = (id) => {
    setData(prev => ({
      ...prev,
      courses: (prev.courses || []).filter(c => c.id !== id)
    }));
  };

  // --- To-Do List ---
  const addTask = (task) => {
    setData(prev => ({
      ...prev,
      tasks: [{ ...task, id: generateId(), completed: false, createdAt: Date.now(), completedAt: null }, ...(prev.tasks || [])]
    }));
  };

  const updateTask = (id, updates) => {
    setData(prev => ({
      ...prev,
      tasks: (prev.tasks || []).map(t => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates };
        if (updates.completed !== undefined && updates.completed && !t.completed) {
          updated.completedAt = Date.now();
        }
        if (updates.completed !== undefined && !updates.completed) {
          updated.completedAt = null;
        }
        return updated;
      })
    }));
  };

  const deleteTask = (id) => {
    setData(prev => ({
      ...prev,
      tasks: (prev.tasks || []).filter(t => t.id !== id)
    }));
  };

  const clearCompletedTasks = () => {
    setData(prev => ({
      ...prev,
      tasks: (prev.tasks || []).filter(t => !t.completed)
    }));
  };

  // --- Vision Board ---
  const addVisionGoal = (goal) => {
    setData(prev => ({
      ...prev,
      visionGoals: [{
        ...goal,
        id: generateId(),
        status: 'Not Started',
        progress: 0,
        createdAt: Date.now()
      }, ...(prev.visionGoals || [])]
    }));
  };

  const updateVisionGoal = (id, updates) => {
    setData(prev => ({
      ...prev,
      visionGoals: (prev.visionGoals || []).map(g => g.id === id ? { ...g, ...updates } : g)
    }));
  };

  const deleteVisionGoal = (id) => {
    setData(prev => ({
      ...prev,
      visionGoals: (prev.visionGoals || []).filter(g => g.id !== id)
    }));
  };

  return {
    courses: data.courses || [],
    tasks: data.tasks || [],
    visionGoals: data.visionGoals || [],
    addCourse, updateCourse, deleteCourse,
    addTask, updateTask, deleteTask, clearCompletedTasks,
    addVisionGoal, updateVisionGoal, deleteVisionGoal,
    generateId,
  };
}
