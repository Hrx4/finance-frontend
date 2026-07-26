import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import TransactionTable from '../components/TransactionTable';
import Pagination from '../components/Pagination';
import TransactionForm from '../components/TransactionForm';
import ConfirmDialog from '../components/ConfirmDialog';

const PAGE_SIZE = 10;

export default function Transactions() {
  const [data, setData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0, pageSize: PAGE_SIZE });
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [keyword, setKeyword] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('transactionDate');
  const [sortDir, setSortDir] = useState('desc');

  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api
      .get('/api/categories')
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // debounce keyword input
  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(keywordInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [keywordInput]);

  const loadTransactions = useCallback(() => {
    setLoading(true);
    api
      .get('/api/transactions', {
        type: type || undefined,
        categoryId: categoryId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        keyword: keyword || undefined,
        page,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
      })
      .then(setData)
      .catch(() => setData({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0, pageSize: PAGE_SIZE }))
      .finally(() => setLoading(false));
  }, [type, categoryId, startDate, endDate, keyword, page, sortBy, sortDir]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingTransaction(null);
    showToast(editingTransaction ? 'Transaction updated.' : 'Transaction added.');
    loadTransactions();
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    setDeleting(true);
    try {
      await api.del(`/api/transactions/${deletingTransaction.id}`);
      setDeletingTransaction(null);
      showToast('Transaction deleted.');
      loadTransactions();
    } catch (err) {
      showToast('Couldn\'t delete that transaction.');
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setType('');
    setCategoryId('');
    setStartDate('');
    setEndDate('');
    setKeywordInput('');
    setKeyword('');
    setPage(0);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">All your income and expenses in one place.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingTransaction(null);
            setShowForm(true);
          }}
        >
          + Add transaction
        </button>
      </div>

      <div className="filters-bar">
        <input
          className="input input-search"
          placeholder="Search by title…"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
        />
        <select
          className="select"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
        <select
          className="select"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="input"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setPage(0);
          }}
        />
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>to</span>
        <input
          type="date"
          className="input"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setPage(0);
          }}
        />
        {(type || categoryId || startDate || endDate || keyword) && (
          <button className="btn btn-secondary btn-sm" onClick={resetFilters}>
            Clear filters
          </button>
        )}
      </div>

      <TransactionTable
        transactions={data.content}
        loading={loading}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={(key, dir) => {
          setSortBy(key);
          setSortDir(dir);
          setPage(0);
        }}
        onEdit={(t) => {
          setEditingTransaction(t);
          setShowForm(true);
        }}
        onDelete={(t) => setDeletingTransaction(t)}
      />

      <Pagination
        pageNumber={data.pageNumber}
        totalPages={data.totalPages}
        totalElements={data.totalElements}
        pageSize={data.pageSize}
        onPageChange={setPage}
      />

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {deletingTransaction && (
        <ConfirmDialog
          title="Delete transaction"
          message={`Delete "${deletingTransaction.title}"? This can't be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingTransaction(null)}
          loading={deleting}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
