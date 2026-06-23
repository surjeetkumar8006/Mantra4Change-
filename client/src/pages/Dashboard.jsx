import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import MetricCard from '../components/MetricCard';
import FiltersBar from '../components/FiltersBar';
import PerformanceTable from '../components/PerformanceTable';

function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [geographyData, setGeographyData] = useState([]);
  const [summary, setSummary] = useState('');
  const [actions, setActions] = useState([]);
  
  const [filters, setFilters] = useState({
    month: '2025-08',
    district: '',
    block: '',
    grade: '',
    subject: ''
  });

  const fetchData = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      
      const [metricsRes, geoRes, summaryRes, actionsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/dashboard/metrics?${query}`),
        axios.get(`http://localhost:5000/api/dashboard/performance?${query}`),
        axios.get(`http://localhost:5000/api/dashboard/summary?${query}`),
        axios.get(`http://localhost:5000/api/dashboard/actions?${query}`)
      ]);

      setMetrics(metricsRes.data);
      setGeographyData(geoRes.data);
      setSummary(summaryRes.data.summary);
      setActions(actionsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Prepare data for Recharts
  const chartData = geographyData.map(row => ({
    name: (row.block || row.district || 'Unknown').replace('District A - ', ''), // Shorten names for chart
    Participation: Number((row.participationRate * 100).toFixed(1))
  })).slice(0, 10); // Show top 10

  const getBarColor = (value) => {
    if (value >= 75) return '#10b981'; // success
    if (value >= 60) return '#f59e0b'; // warning
    if (value >= 35) return '#ef4444'; // danger
    return '#b91c1c'; // critical
  };

  return (
    <div className="main-content">
      <div className="header">
        <h2>Program Review Dashboard</h2>
        <p>Monitor program implementation, attendance, and evidence submissions.</p>
      </div>

      <FiltersBar filters={filters} handleFilterChange={handleFilterChange} />

      {metrics && (
        <div className="grid-metrics">
          <MetricCard title="Total Schools" value={metrics.totalSchools} />
          <MetricCard 
            title="Participating Schools" 
            value={metrics.participatingSchools} 
            trend={metrics.momParticipation !== undefined ? `${metrics.momParticipation > 0 ? '+' : ''}${metrics.momParticipation.toFixed(1)}%` : null}
            trendType={metrics.momParticipation > 0 ? 'positive' : metrics.momParticipation < 0 ? 'negative' : 'neutral'}
          />
          <MetricCard title="Evidence Submission" value={`${metrics.evidenceSubmissionPercentage.toFixed(1)}%`} />
          <MetricCard title="Total Enrollment" value={metrics.totalEnrollment.toLocaleString()} />
          <MetricCard 
            title="Overall Attendance" 
            value={`${metrics.attendancePercentage.toFixed(1)}%`} 
            trend={metrics.momAttendance !== undefined ? `${metrics.momAttendance > 0 ? '+' : ''}${metrics.momAttendance.toFixed(1)}%` : null}
            trendType={metrics.momAttendance > 0 ? 'positive' : metrics.momAttendance < 0 ? 'negative' : 'neutral'}
          />
        </div>
      )}

      {/* Tier 2: Review Summary */}
      {summary && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: 'var(--primary)' }}>📝 Monthly Review Summary</h3>
          <p style={{ lineHeight: '1.6', color: 'var(--text-accent)' }}>{summary}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }}>
        {/* Visual Charts */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Participation by Geography</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} angle={-45} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: 'rgba(79,70,229,0.05)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="Participation" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.Participation)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier 3: Recommended Actions */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.25rem', color: 'var(--danger)' }}>⚠️ Priority Actions</h3>
          {actions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {actions.map(action => (
                <div key={action.id} style={{ background: 'rgba(255,255,255,0.6)', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="badge Critical" style={{fontSize: '0.7rem', padding: '2px 8px'}}>{action.priority} Priority</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: {action.dueDate}</span>
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '8px', color: 'var(--text-main)' }}>{action.title}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Owner: {action.owner}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '4px' }}>Metric: {action.linkedMetric}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No critical actions required.</p>
          )}
        </div>
      </div>

      <PerformanceTable geographyData={geographyData} />
    </div>
  );
}

export default Dashboard;
