import { useState, useEffect } from 'react';

const STORAGE_KEY = 'begin_finance';

const defaultState = {
  transactions: [],
  options: [
    { id: 'general', name: 'General' },
    { id: 'savings', name: 'General Savings' }
  ],
};

export function useFinanceStore(activeOptionId = 'general') {
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

  // Build safe options list
  const rawOptions = data.options || [];

  // Categorize options: custom vs built-in
  const customOptions = rawOptions.filter(o => o.id !== 'general' && o.id !== 'savings');
  const generalOpt = rawOptions.find(o => o.id === 'general') || { id: 'general', name: 'General' };
  const savingsOpt = rawOptions.find(o => o.id === 'savings') || { id: 'savings', name: 'General Savings' };

  // Final list: custom ones first (new ones will be at start of custom section), then defaults
  const safeOptions = [
    ...customOptions,
    generalOpt,
    savingsOpt
  ];

  function getTransactionOptionId(tx) {
    if (tx.optionId) return tx.optionId;
    if (tx.type === 'saved') return tx.goalId === 'default' ? 'savings' : (tx.goalId || 'savings');
    return 'general';
  }

  // Compute state dynamically for the active option
  const activeTransactions = (data.transactions || []).filter(t => getTransactionOptionId(t) === activeOptionId);
  
  let balance = 0;
  let totalIn = 0;
  let totalOut = 0;

  activeTransactions.forEach(tx => {
    if (tx.type === 'in' || tx.type === 'saved') {
      balance += tx.amount;
      totalIn += tx.amount;
    } else if (tx.type === 'out') {
      balance -= tx.amount;
      totalOut += tx.amount;
    }
  });

  function addMoney(amount, note) {
    const tx = {
      id: '_' + Math.random().toString(36).slice(2, 9),
      type: 'in',
      amount: parseFloat(amount),
      note: note || 'Income',
      optionId: activeOptionId,
      date: Date.now(),
    };
    setData(prev => ({ ...prev, transactions: [tx, ...(prev.transactions || [])] }));
  }

  function spendMoney(amount, note) {
    const tx = {
      id: '_' + Math.random().toString(36).slice(2, 9),
      type: 'out',
      amount: parseFloat(amount),
      note: note || 'Expense',
      optionId: activeOptionId,
      date: Date.now(),
    };
    setData(prev => ({ ...prev, transactions: [tx, ...(prev.transactions || [])] }));
  }

  function deleteTransaction(id) {
    setData(prev => ({
      ...prev,
      transactions: (prev.transactions || []).filter(t => t.id !== id),
    }));
  }

  function addOption(name) {
    if (!name.trim()) return null;
    const newOpt = {
      id: '_' + Math.random().toString(36).slice(2, 9),
      name: name.trim(),
    };
    
    setData(prev => {
      const opts = prev.options || [];
      return { ...prev, options: [newOpt, ...opts] };
    });
    return newOpt.id;
  }

  function deleteOption(id) {
    if (id === 'general' || id === 'savings') return;
    setData(prev => {
      const newOptions = (prev.options || []).filter(o => o.id !== id);
      const newTransactions = (prev.transactions || []).filter(t => t.optionId !== id && getTransactionOptionId(t) !== id);
      return { ...prev, options: newOptions, transactions: newTransactions };
    });
  }

  function clearAll() {
    setData(prev => ({ ...defaultState, options: prev.options || defaultState.options }));
  }

  return { 
    options: safeOptions, 
    transactions: activeTransactions,
    balance,
    totalIn,
    totalOut,
    addMoney, 
    spendMoney, 
    deleteTransaction, 
    addOption,
    deleteOption,
    clearAll 
  };
}
