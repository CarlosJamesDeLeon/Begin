import { useState, useEffect } from 'react';

const STORAGE_KEY = 'begin_finance';

const defaultState = {
  balance: 0,
  totalIn: 0,
  totalSaved: 0,
  transactions: [],
};

export function useFinanceStore() {
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

  function addMoney(amount, note) {
    const tx = {
      id: '_' + Math.random().toString(36).slice(2, 9),
      type: 'in',
      amount: parseFloat(amount),
      note: note || 'Income',
      date: Date.now(),
    };
    setData(prev => ({
      ...prev,
      balance: prev.balance + tx.amount,
      totalIn: prev.totalIn + tx.amount,
      transactions: [tx, ...prev.transactions],
    }));
  }

  function spendMoney(amount, note) {
    const tx = {
      id: '_' + Math.random().toString(36).slice(2, 9),
      type: 'out',
      amount: parseFloat(amount),
      note: note || 'Expense',
      date: Date.now(),
    };
    setData(prev => ({
      ...prev,
      balance: prev.balance - tx.amount,
      transactions: [tx, ...prev.transactions],
    }));
  }

  function saveMoney(amount, note) {
    const tx = {
      id: '_' + Math.random().toString(36).slice(2, 9),
      type: 'saved',
      amount: parseFloat(amount),
      note: note || 'Saved',
      date: Date.now(),
    };
    setData(prev => ({
      ...prev,
      balance: prev.balance - tx.amount,
      totalSaved: prev.totalSaved + tx.amount,
      transactions: [tx, ...prev.transactions],
    }));
  }

  function deleteTransaction(id) {
    const tx = data.transactions.find(t => t.id === id);
    if (!tx) return;
    setData(prev => {
      let { balance, totalIn, totalSaved } = prev;
      if (tx.type === 'in')    { balance -= tx.amount; totalIn -= tx.amount; }
      if (tx.type === 'out')   { balance += tx.amount; }
      if (tx.type === 'saved') { balance += tx.amount; totalSaved -= tx.amount; }
      return {
        ...prev,
        balance,
        totalIn,
        totalSaved,
        transactions: prev.transactions.filter(t => t.id !== id),
      };
    });
  }

  function clearAll() {
    setData(defaultState);
  }

  return { ...data, addMoney, spendMoney, saveMoney, deleteTransaction, clearAll };
}
