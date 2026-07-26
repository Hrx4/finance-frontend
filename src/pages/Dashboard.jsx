import { useEffect, useState } from 'react';
import { api } from '../api/client';
import SummaryCards from '../components/SummaryCards';
import CategoryPieChart from '../components/CategoryPieChart';
import MonthlyTrendChart from '../components/MonthlyTrendChart';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [expenseData, setExpenseData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [pieLoading, setPieLoading] = useState(true);

  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [months, setMonths] = useState(6);

  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setSummaryLoading(true);
    api
      .get('/api/dashboard/summary')
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => {
    setPieLoading(true);
    Promise.all([
      api.get('/api/dashboard/chart/category-breakdown', { type: 'EXPENSE' }),
      api.get('/api/dashboard/chart/category-breakdown', { type: 'INCOME' }),
    ])
      .then(([expense, income]) => {
        setExpenseData(expense || []);
        setIncomeData(income || []);
      })
      .catch(() => {
        setExpenseData([]);
        setIncomeData([]);
      })
      .finally(() => setPieLoading(false));
  }, []);

  useEffect(() => {
    setTrendLoading(true);
    api
      .get('/api/dashboard/chart/monthly-trend', { months })
      .then(setTrendData)
      .catch(() => setTrendData([]))
      .finally(() => setTrendLoading(false));
  }, [months]);

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const blob = await api.getBlob('/api/reports/pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setToast('Couldn\'t generate the report. Try again.');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your all-time overview.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleDownloadReport} disabled={downloading}>
          {downloading ? 'Preparing…' : '⬇ Download report'}
        </button>
      </div>

      <SummaryCards summary={summary} loading={summaryLoading} />

      <div className="charts-grid">
        <MonthlyTrendChart data={trendData} loading={trendLoading} months={months} onMonthsChange={setMonths} />
        <CategoryPieChart
          title="Expense breakdown"
          subtitle="All-time, by category"
          data={expenseData}
          type="EXPENSE"
          loading={pieLoading}
        />
      </div>

      <div className="charts-grid" style={{ gridTemplateColumns: '1fr' }}>
        <CategoryPieChart
          title="Income breakdown"
          subtitle="All-time, by category"
          data={incomeData}
          type="INCOME"
          loading={pieLoading}
        />
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
