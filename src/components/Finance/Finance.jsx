import { useState, useRef, useEffect } from 'react';
import styles from './Finance.module.css';
import { useFinanceStore } from './useFinanceStore';

/* ── tiny helpers ── */
function fmt(n) {
  return Math.abs(n).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function relativeDate(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  if (h < 48)  return 'yesterday';
  return new Date(ts).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

/* ── icons ── */
const IconIn = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="4" x2="10" y2="16"/><polyline points="5,11 10,16 15,11"/>
  </svg>
);

const IconOut = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="16" x2="10" y2="4"/><polyline points="5,9 10,4 15,9"/>
  </svg>
);

const IconSaved = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3C6.134 3 3 6.134 3 10s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7z"/>
    <polyline points="7,10 9,12 13,8"/>
  </svg>
);

const IconTrash = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,3.5 12,3.5"/>
    <path d="M4.5,3.5V2.5a.5.5,0,0,1,.5-.5h4a.5.5,0,0,1,.5.5v1"/>
    <rect x="3" y="4.5" width="8" height="7" rx="1"/>
  </svg>
);

const IconBack = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9,2 5,7 9,12"/>
  </svg>
);

/* ── action config ── */
const ACTIONS = {
  in:    { label: 'Add Money',  sub: 'income',   Icon: IconIn,    color: 'In',    btnClass: 'btnIn',    confirmClass: 'confirmIn',    placeholder: 'e.g. Allowance, salary…' },
  out:   { label: 'Spent',      sub: 'expense',   Icon: IconOut,   color: 'Out',   btnClass: 'btnOut',   confirmClass: 'confirmOut',   placeholder: 'e.g. Groceries, transport…' },
};

/* ════════════════════════════════════
   FINANCE COMPONENT
════════════════════════════════════ */
export default function Finance({ onBack }) {
  const [activeOptionId, setActiveOptionId] = useState('general');
  const store = useFinanceStore(activeOptionId);
  const [activeAction, setActiveAction] = useState(null);
  const [amount, setAmount]             = useState('');
  const [note, setNote]                 = useState('');
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionName, setNewOptionName] = useState('');
  const amountRef = useRef(null);
  const newGoalRef = useRef(null);

  useEffect(() => {
    if (isAddingOption && newGoalRef.current) {
      newGoalRef.current.focus();
    }
  }, [isAddingOption]);

  /* focus amount input when panel opens */
  useEffect(() => {
    if (activeAction && amountRef.current) {
      setTimeout(() => amountRef.current?.focus(), 80);
    }
  }, [activeAction]);

  function toggleAction(type) {
    if (activeAction === type) {
      setActiveAction(null);
    } else {
      setActiveAction(type);
      setAmount('');
      setNote('');
    }
  }

  function handleConfirm() {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    if (activeAction === 'in')    store.addMoney(val, note);
    if (activeAction === 'out')   store.spendMoney(val, note);
    setAmount('');
    setNote('');
    setActiveAction(null);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') setActiveAction(null);
  }

  const cfg = activeAction ? ACTIONS[activeAction] : null;
  const isNeg = store.balance < 0;

  /* ── left panel content (shared mobile/desktop) ── */
  const LeftContent = (
    <>
      <div className={styles.optionSelectorRow}>
        <div className={styles.goalTabs}>
          {store.options.map(o => (
            <button 
              key={o.id} 
              className={`${styles.goalTab} ${activeOptionId === o.id ? styles.goalTabActive : ''}`}
              onClick={() => {
                setActiveOptionId(o.id);
                setActiveAction(null);
              }}
            >
              {o.name}
            </button>
          ))}
          {!isAddingOption ? (
            <button className={styles.goalTabAdd} onClick={() => setIsAddingOption(true)}>
              + Add option
            </button>
          ) : (
            <input 
              ref={newGoalRef}
              type="text"
              className={styles.newGoalInput}
              placeholder="Option name..."
              value={newOptionName}
              onChange={e => setNewOptionName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newOptionName.trim()) {
                    const id = store.addOption(newOptionName);
                    if (id) setActiveOptionId(id);
                    setIsAddingOption(false);
                    setNewOptionName('');
                  }
                }
                if (e.key === 'Escape') setIsAddingOption(false);
              }}
              onBlur={() => {
                if (newOptionName.trim()) {
                  const id = store.addOption(newOptionName);
                  if (id) setActiveOptionId(id);
                }
                setIsAddingOption(false);
                setNewOptionName('');
              }}
            />
          )}
        </div>
      </div>

      {/* Balance hero */}
      <div className={styles.balanceHero}>
        <div className={styles.balanceLabel}>Current balance</div>
        <div className={`${styles.balanceAmount} ${isNeg ? styles.negative : ''}`}>
          <span className={styles.balanceCurrency}>₱</span>
          {fmt(store.balance)}
        </div>

        <div className={styles.summaryRow}>
          <div className={`${styles.summaryPill} ${styles.pillIn}`}>
            <span className={styles.pillDot}></span>
            ₱{fmt(store.totalIn)} in
          </div>
          <div className={`${styles.summaryPill} ${styles.pillOut}`}>
            <span className={styles.pillDot}></span>
            ₱{fmt(store.totalOut)} out
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className={styles.actionRow}>
        {Object.entries(ACTIONS).map(([type, a]) => (
          <button
            key={type}
            className={`${styles.actionBtn} ${styles[a.btnClass]} ${activeAction === type ? styles.active : ''}`}
            onClick={() => toggleAction(type)}
          >
            <div className={`${styles.actionIcon} ${styles['icon' + a.color]}`}>
              <a.Icon />
            </div>
            <span className={styles.actionLabel}>{a.label}</span>
            <span className={styles.actionSub}>{a.sub}</span>
          </button>
        ))}
      </div>

      {/* Input panel */}
      {activeAction && cfg && (
        <div className={styles.inputPanel}>
          <div className={styles.inputPanelInner}>
            <div className={`${styles.inputPanelTitle} ${styles['color' + cfg.color]}`}>
              {cfg.label}
            </div>

            <div className={styles.amountRow}>
              <span className={styles.pesoSign}>₱</span>
              <input
                ref={amountRef}
                type="number"
                min="0"
                step="0.01"
                className={styles.amountInput}
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <input
              type="text"
              className={styles.noteInput}
              placeholder={cfg.placeholder}
              value={note}
              onChange={e => setNote(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button
              className={`${styles.confirmBtn} ${styles[cfg.confirmClass]}`}
              onClick={handleConfirm}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Confirm {cfg.label}
            </button>
          </div>
        </div>
      )}
    </>
  );

  /* ── right panel content ── */
  const RightContent = (
    <div className={styles.txSection}>
      <div className={styles.txHeader}>
        <div className={styles.sectionLabel}>Transactions</div>
        <div className={styles.txCount}>{store.transactions.length} entries</div>
      </div>

      {store.transactions.length === 0 ? (
        <div className={styles.txEmpty}>
          No transactions yet — add one above.
        </div>
      ) : (
        <div className={styles.txList}>
          {store.transactions.map((tx, i) => {
            const isIn = tx.type === 'in' || tx.type === 'saved'; // legacy 'saved' fallback
            return (
              <div
                key={tx.id}
                className={styles.txItem}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className={`${styles.txTypeIcon} ${styles[`iconBg${isIn ? 'In' : 'Out'}`]}`}>
                  {isIn ? <IconIn /> : <IconOut />}
                </div>

                <div className={styles.txDetails}>
                  <div className={styles.txNote}>
                    {tx.note}
                  </div>
                  <div className={styles.txDate}>{relativeDate(tx.date)}</div>
                </div>

                <div className={styles.txRight}>
                  <div className={`${styles.txAmount} ${styles[`amt${isIn ? 'In' : 'Out'}`]}`}>
                    {isIn ? '+' : '−'}₱{fmt(tx.amount)}
                  </div>
                  <button
                    className={styles.txDeleteBtn}
                    onClick={() => store.deleteTransaction(tx.id)}
                    title="Delete"
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {onBack && (
            <button className={styles.backBtn} onClick={onBack}>
              <IconBack />
            </button>
          )}
          <div className={styles.headerTitle}>Finance</div>
        </div>
        {store.transactions.length > 0 && (
          <button className={styles.clearBtn} onClick={() => {
            if (window.confirm('Clear all transactions?')) store.clearAll();
          }}>
            Clear all
          </button>
        )}
      </header>

      {/* Desktop: two-column layout via CSS grid */}
      <div className={styles.leftPanel}>
        {LeftContent}
      </div>
      <div className={styles.rightPanel}>
        {RightContent}
      </div>
    </div>
  );
}
