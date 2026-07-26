import { formatCurrency } from './SummaryCards';

const columns = [
  { key: 'transactionDate', label: 'Date' },
  { key: 'title', label: 'Title' },
  { key: null, label: 'Category' },
  { key: null, label: 'Type' },
  { key: 'amount', label: 'Amount' },
  { key: null, label: '' },
];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TransactionTable({ transactions, loading, sortBy, sortDir, onSortChange, onEdit, onDelete }) {
  const handleSort = (key) => {
    if (!key) return;
    if (sortBy === key) {
      onSortChange(key, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(key, 'desc');
    }
  };

  const arrow = (key) => {
    if (sortBy !== key) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading-row">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">No transactions match these filters. Try adjusting them, or add a new one.</div>
      </div>
    );
  }

  return (
    <div className="card table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} onClick={() => handleSort(col.key)} style={{ cursor: col.key ? 'pointer' : 'default' }}>
                {col.label}
                {col.key ? arrow(col.key) : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{formatDate(t.transactionDate)}</td>
              <td>
                <div>{t.title}</div>
                {t.description && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.description}</div>
                )}
              </td>
              <td>{t.categoryName}</td>
              <td>
                <span className={`badge ${t.type === 'INCOME' ? 'income' : 'expense'}`}>
                  {t.type === 'INCOME' ? 'Income' : 'Expense'}
                </span>
              </td>
              <td className={`amount-cell ${t.type === 'INCOME' ? 'income' : 'expense'}`}>
                {t.type === 'INCOME' ? '+' : '−'}
                {formatCurrency(t.amount)}
              </td>
              <td>
                <div className="row-actions">
                  <button className="icon-btn" title="Edit" onClick={() => onEdit(t)}>
                    ✎
                  </button>
                  <button className="icon-btn danger" title="Delete" onClick={() => onDelete(t)}>
                    🗑
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
