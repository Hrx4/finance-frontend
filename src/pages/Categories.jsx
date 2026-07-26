import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/api/categories')
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/api/categories', { name, type });
      setName('');
      setType('EXPENSE');
      setShowForm(false);
      showToast('Category created.');
      load();
    } catch (err) {
      if (err.status === 409) {
        setError('You already have a category with that name and type.');
      } else {
        setError(err.message || 'Couldn\'t create this category.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const income = categories.filter((c) => c.type === 'INCOME');
  const expense = categories.filter((c) => c.type === 'EXPENSE');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Defaults are shared by everyone. Add your own to fit your habits.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Add category'}
        </button>
      </div>

      {showForm && (
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 180 }}>
              <label htmlFor="cat-name">Name</label>
              <input
                id="cat-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Side Hustle"
                required
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="cat-type">Type</label>
              <select id="cat-type" className="select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save category'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card">
          <div className="loading-row">
            <div className="spinner" />
          </div>
        </div>
      ) : (
        <>
          <h2 className="category-section-title">Expense categories</h2>
          <div className="categories-grid">
            {expense.map((c) => (
              <div className="card category-chip" key={c.id}>
                <span className="category-chip-name">{c.name}</span>
                {c.isDefault ? (
                  <span className="badge expense">Default</span>
                ) : (
                  <span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                    Custom
                  </span>
                )}
              </div>
            ))}
          </div>

          <h2 className="category-section-title">Income categories</h2>
          <div className="categories-grid">
            {income.map((c) => (
              <div className="card category-chip" key={c.id}>
                <span className="category-chip-name">{c.name}</span>
                {c.isDefault ? (
                  <span className="badge income">Default</span>
                ) : (
                  <span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                    Custom
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
