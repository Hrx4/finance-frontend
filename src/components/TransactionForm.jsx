import { useEffect, useState } from 'react';
import { api } from '../api/client';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function TransactionForm({ transaction, onClose, onSaved }) {
  const isEdit = !!transaction;
  const [type, setType] = useState(transaction?.type || 'EXPENSE');
  const [title, setTitle] = useState(transaction?.title || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [amount, setAmount] = useState(transaction?.amount ?? '');
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '');
  const [transactionDate, setTransactionDate] = useState(transaction?.transactionDate || todayStr());

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setCategoriesLoading(true);
    api
      .get('/api/categories', { type })
      .then((cats) => {
        setCategories(cats || []);
        // if current categoryId doesn't belong to this type's list, reset it
        setCategoryId((prev) => {
          const stillValid = (cats || []).some((c) => c.id === prev);
          return stillValid ? prev : '';
        });
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});

    if (!categoryId) {
      setFieldErrors({ categoryId: 'Choose a category.' });
      return;
    }

    const payload = {
      title,
      description: description || undefined,
      amount: Number(amount),
      type,
      categoryId: Number(categoryId),
      transactionDate,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/api/transactions/${transaction.id}`, payload);
      } else {
        await api.post('/api/transactions', payload);
      }
      onSaved();
    } catch (err) {
      if (err.status === 400 && err.body?.fieldErrors) {
        setFieldErrors(err.body.fieldErrors);
      } else {
        setFormError(err.message || 'Couldn\'t save this transaction. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card modal-card">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit transaction' : 'Add transaction'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {formError && <div className="auth-error">{formError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Type</label>
            <div className="type-toggle">
              <button
                type="button"
                className={`${type === 'EXPENSE' ? 'active expense' : ''}`}
                onClick={() => setType('EXPENSE')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`${type === 'INCOME' ? 'active income' : ''}`}
                onClick={() => setType('INCOME')}
              >
                Income
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Grocery run"
              required
            />
            {fieldErrors.title && <div className="field-error">{fieldErrors.title}</div>}
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                className="input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
              {fieldErrors.amount && <div className="field-error">{fieldErrors.amount}</div>}
            </div>
            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                className="input"
                value={transactionDate}
                max={todayStr()}
                onChange={(e) => setTransactionDate(e.target.value)}
                required
              />
              {fieldErrors.transactionDate && <div className="field-error">{fieldErrors.transactionDate}</div>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              className="select"
              style={{ width: '100%' }}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={categoriesLoading}
            >
              <option value="">{categoriesLoading ? 'Loading…' : 'Select a category'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId && <div className="field-error">{fieldErrors.categoryId}</div>}
          </div>

          <div className="field">
            <label htmlFor="description">Description (optional)</label>
            <input
              id="description"
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Weekly groceries at BigBasket"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
