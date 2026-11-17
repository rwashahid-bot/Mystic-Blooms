import './BarChart.css';

/** Lightweight dependency-free bar chart. data: [{ label, value }] */
const BarChart = ({ data = [], format = (v) => v, height = 200, emptyText = 'No data for this period' }) => {
  if (!data.length || data.every((d) => !d.value)) return <p className="bar-chart__empty">{emptyText}</p>;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bar-chart" style={{ height }} role="img" aria-label="Bar chart">
      {data.map((d) => (
        <div className="bar-chart__col" key={d.label} title={`${d.label}: ${format(d.value)}`}>
          <span className="bar-chart__value">{d.value ? format(d.value) : ''}</span>
          <div className="bar-chart__bar" style={{ height: `${(d.value / max) * 100}%` }} />
          <span className="bar-chart__label">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BarChart;
