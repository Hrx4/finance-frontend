import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from './SummaryCards';

const EXPENSE_COLORS = ['#D8455F', '#E8748A', '#F0A0AF', '#F7C6CF', '#5C3440', '#8A5866'];
const INCOME_COLORS = ['#17945F', '#4CB585', '#7FCBA6', '#B3E1CB', '#0D5B3B', '#2E7A57'];

export default function CategoryPieChart({ title, subtitle, data, type, loading }) {
  const colors = type === 'INCOME' ? INCOME_COLORS : EXPENSE_COLORS;
  const hasData = data && data.length > 0;

  return (
    <div className="card card-pad">
      <h3 className="chart-card-title">{title}</h3>
      <p className="chart-card-subtitle">{subtitle}</p>

      {loading ? (
        <div className="loading-row">
          <div className="spinner" />
        </div>
      ) : !hasData ? (
        <div className="empty-state">No {type === 'INCOME' ? 'income' : 'expense'} data for this period yet.</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="categoryName"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={entry.categoryId} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ borderRadius: 8, border: '1px solid #E6E8F0', fontSize: 13 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {data.map((entry, i) => (
              <div className="pie-legend-row" key={entry.categoryId}>
                <span className="pie-legend-label">
                  <span className="dot" style={{ background: colors[i % colors.length] }} />
                  {entry.categoryName}
                </span>
                <span className="pie-legend-amount">
                  {formatCurrency(entry.amount)} · {entry.percentage?.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
