import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { formatCurrency } from './SummaryCards';

export default function MonthlyTrendChart({ data, loading, months, onMonthsChange }) {
  const hasData = data && data.length > 0;

  return (
    <div className="card card-pad">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 className="chart-card-title">Income vs. expense</h3>
          <p className="chart-card-subtitle">Monthly trend</p>
        </div>
        <select
          className="select"
          value={months}
          onChange={(e) => onMonthsChange(Number(e.target.value))}
        >
          <option value={3}>Last 3 months</option>
          <option value={6}>Last 6 months</option>
          <option value={12}>Last 12 months</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-row">
          <div className="spinner" />
        </div>
      ) : !hasData ? (
        <div className="empty-state">No transactions yet to chart.</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#E6E8F0" vertical={false} />
            <XAxis dataKey="monthLabel" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#E6E8F0' }} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ borderRadius: 8, border: '1px solid #E6E8F0', fontSize: 13 }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar dataKey="income" name="Income" fill="#17945F" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#D8455F" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
