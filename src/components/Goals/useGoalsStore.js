import { useState, useEffect } from 'react';

const STORAGE_KEY = 'begin_goals';

const defaultState = {
  courses: [],
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
      courses: [...prev.courses, { ...course, id: generateId() }]
    }));
  };

  const updateCourse = (id, updates) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const deleteCourse = (id) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== id)
    }));
  };

  // --- To-Do List ---
  const addTask = (task) => {
    setData(prev => ({
      ...prev,
      tasks: [{ ...task, id: generateId(), completed: false, createdAt: Date.now() }, ...prev.tasks]
    }));
  };

  const updateTask = (id, updates) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const deleteTask = (id) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  // --- Vision Board ---
  const addVisionGoal = (goal) => {
    setData(prev => ({
      ...prev,
      visionGoals: [{ ...goal, id: generateId(), status: 'Not Started', createdAt: Date.now() }, ...prev.visionGoals]
    }));
  };

  const updateVisionGoal = (id, updates) => {
    setData(prev => ({
      ...prev,
      visionGoals: prev.visionGoals.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
  };

  const deleteVisionGoal = (id) => {
    setData(prev => ({
      ...prev,
      visionGoals: prev.visionGoals.filter(g => g.id !== id)
    }));
  };

  return {
    courses: data.courses || [],
    tasks: data.tasks || [],
    visionGoals: data.visionGoals || [],
    addCourse, updateCourse, deleteCourse,
    addTask, updateTask, deleteTask,
    addVisionGoal, updateVisionGoal, deleteVisionGoal
  };
}
