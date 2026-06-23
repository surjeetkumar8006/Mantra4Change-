import React from 'react';

function MetricCard({ title, value, trend, trendType }) {
  return (
    <div className="glass-panel metric-card">
      <h3>{title}</h3>
      <div className="value">{value}</div>
      {trend && (
        <div className={`trend ${trendType}`}>
          {trendType === 'positive' ? '↑' : trendType === 'negative' ? '↓' : '•'} {trend}
        </div>
      )}
    </div>
  );
}

export default MetricCard;
