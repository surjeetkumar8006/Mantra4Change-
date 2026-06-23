import React from 'react';

function PerformanceTable({ geographyData }) {
  if (!geographyData || geographyData.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      <h3 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>District & Block Performance</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Geography</th>
              <th>Type</th>
              <th>Participation</th>
              <th>Risk Status</th>
            </tr>
          </thead>
          <tbody>
            {geographyData.map((row, i) => {
              const partRate = row.participationRate * 100;
              let riskStr = 'On Track';
              let badgeClass = 'OnTrack';
              if (partRate < 75) { riskStr = 'Behind'; badgeClass = 'Behind'; }
              if (partRate < 60) { riskStr = 'At Risk'; badgeClass = 'AtRisk'; }
              if (partRate < 35) { riskStr = 'Critical'; badgeClass = 'Critical'; }
              
              const geoName = row.block || row.district || 'Unknown';
              const typeStr = row.block ? 'Block' : 'District';

              return (
                <tr key={i}>
                  <td>{geoName}</td>
                  <td style={{color: 'var(--text-muted)'}}>{typeStr}</td>
                  <td style={{fontFamily: 'Outfit', fontWeight: 600}}>
                    {partRate.toFixed(1)}% <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400}}>({Math.round(row.participationRate * row.totalSchools)}/{row.totalSchools})</span>
                  </td>
                  <td>
                    <span className={`badge ${badgeClass}`}>{riskStr}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PerformanceTable;
