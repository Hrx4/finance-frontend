function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export default function SummaryCards({ summary, loading }) {
  const items = [
    {
      key: 'income',
      label: 'Total income',
      value: summary?.totalIncome,
      dot: 'income',
      valueClass: 'income',
    },
    {
      key: 'expense',
      label: 'Total expense',
      value: summary?.totalExpense,
      dot: 'expense',
      valueClass: 'expense',
    },
    {
      key: 'balance',
      label: 'Balance',
      value: summary?.balance,
      dot: 'balance',
      valueClass: '',
    },
    {
      key: 'count',
      label: 'Transactions',
      value: summary?.totalTransactions,
      dot: 'balance',
      valueClass: '',
      raw: true,
    },
  ];

  return (
    <div className="summary-grid">
      {items.map((item) => (
        <div className="card summary-card" key={item.key}>
          <span className="summary-label">
            <span className={`dot ${item.dot}`} />
            {item.label}
          </span>
          <span className={`summary-value ${item.valueClass}`}>
            {loading ? '—' : item.raw ? item.value ?? 0 : formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export { formatCurrency };
