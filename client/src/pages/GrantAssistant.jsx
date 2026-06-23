import { useState, useEffect } from 'react';
import axios from 'axios';

export default function GrantAssistant() {
  const [grantsList, setGrantsList] = useState([]);
  const [monthsList, setMonthsList] = useState([]);
  const [selectedGrant, setSelectedGrant] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [reportData, setReportData] = useState(null);
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch available grants and months
    axios.get('https://mantra4change.onrender.com/api/grants').then(res => {
      setGrantsList(res.data.grants);
      setMonthsList(res.data.months);
    });
  }, []);

  const fetchReport = async () => {
    if (!selectedGrant || !selectedMonth) return;
    setLoading(true);
    try {
      const res = await axios.get(`https://mantra4change.onrender.com/api/grants/report?grantId=${selectedGrant}&month=${selectedMonth}`);
      setReportData(res.data);
      
      // Auto-generate narrative if we have performance data
      if (res.data.performance) {
        const narrRes = await axios.post('https://mantra4change.onrender.com/api/grants/generate-narrative', {
          performance: res.data.performance,
          finance: res.data.finance
        });
        setNarrative(narrRes.data.narrative);
      } else {
        setNarrative('No performance data available for this selection.');
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="header">
        <h2>Grant Reporting Assistant</h2>
        <p>Automated fact retrieval and narrative generation</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          <select 
            className="select-input" 
            value={selectedGrant} 
            onChange={(e) => setSelectedGrant(e.target.value)}
          >
            <option value="">Select Grant</option>
            {grantsList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select 
            className="select-input" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">Select Month</option>
            {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button className="button" onClick={fetchReport} disabled={!selectedGrant || !selectedMonth || loading}>
            {loading ? <span className="loader"></span> : 'Generate Report preview'}
          </button>
        </div>
      </div>

      {reportData && reportData.performance && (
        <div className="report-content">
          <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '24px', fontSize: '1.25rem', fontFamily: 'Outfit' }}>Structured Facts Panel</h3>
            <div className="grant-facts">
              <div>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Performance Metrics</h4>
                <div className="fact-item"><span>PBL Completion:</span> <strong>{(reportData.performance.pblCompletionRate * 100).toFixed(1)}%</strong></div>
                <div className="fact-item"><span>Evidence Submission:</span> <strong>{(reportData.performance.evidenceSubmissionRate * 100).toFixed(1)}%</strong></div>
                <div className="fact-item"><span>Attendance Rate:</span> <strong>{(reportData.performance.attendanceRate * 100).toFixed(1)}%</strong></div>
                <div className="fact-item">
                  <span>Risk Status:</span> 
                  <span className={`badge ${reportData.performance.riskStatus.replace(' ', '')}`}>{reportData.performance.riskStatus}</span>
                </div>

                <h4 style={{ color: 'var(--text-muted)', margin: '24px 0 16px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Finance Utilization</h4>
                <div className="fact-item">
                  <span>Total Budget Units:</span> 
                  <strong>{reportData.finance.reduce((sum, f) => sum + f.approvedBudgetUnits, 0)}</strong>
                </div>
                <div className="fact-item">
                  <span>Cumulative Utilized:</span> 
                  <strong>{reportData.finance.reduce((sum, f) => sum + f.cumulativeUtilizedUnits, 0)}</strong>
                </div>
              </div>
              <div>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Milestone Summary</h4>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-accent)' }}>{reportData.performance.milestoneSummary}</p>
                
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px', marginTop: '24px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Linked Media</h4>
                {reportData.media.length > 0 ? (
                  reportData.media.map(m => (
                    <div className="media-tag" key={m.recordId}>
                      <span style={{fontSize: '1.2rem'}}>📸</span> 
                      <div>
                        <div style={{fontWeight: 500, color: 'var(--text-main)'}}>{m.title}</div>
                        <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{m.district}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No media attached.</p>
                )}
              </div>
            </div>
          </div>

          <div className="glass-panel report-section">
            <h3 style={{ color: 'var(--success)', marginBottom: '20px', fontSize: '1.25rem', fontFamily: 'Outfit' }}>✨ Generated Narrative</h3>
            <p className="generated-text">{narrative}</p>
            <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{fontSize: '1.2rem'}}>🔍</span>
              <div>
                <strong style={{color: 'var(--text-accent)', display: 'block', marginBottom: '4px'}}>Deterministic Traceability</strong>
                This text was generated deterministically using the fact panel data above (Completion Rate, Evidence Rate, Attendance Rate, and Risk Status). It works fully without external LLMs.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
