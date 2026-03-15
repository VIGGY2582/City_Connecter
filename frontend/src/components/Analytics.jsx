import React, { useState, useEffect } from 'react';
import { complaintAPI } from '../services/api';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await complaintAPI.getStats();
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError('Failed to load analytics data.');
        }
      } catch (err) {
        console.error('Error loading stats:', err);
        setError('An error occurred while fetching analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center" style={{ padding: 80 }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
        <p style={{ color: 'var(--clr-text-2)', marginTop: 16 }}>Loading Analytics Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center" style={{ padding: 80 }}>
        <p style={{ color: 'var(--clr-red)', marginTop: 16 }}>{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  // Convert string values from PostgreSQL COUNT to numbers
  const total = parseInt(stats.total) || 0;
  const submitted = parseInt(stats.submitted) || 0;
  const inProgress = parseInt(stats.in_progress) || 0;
  const resolved = parseInt(stats.resolved) || 0;
  const rejected = parseInt(stats.rejected) || 0;
  const assigned = parseInt(stats.assigned) || 0;

  // Status distribution for the bar chart
  const distributionData = [
    { label: 'Submitted', value: submitted, color: 'var(--clr-yellow)', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Assigned', value: assigned, color: 'var(--clr-accent)', bg: 'rgba(14,165,233,0.1)' },
    { label: 'In Progress', value: inProgress, color: 'var(--clr-primary)', bg: 'rgba(37,99,235,0.1)' },
    { label: 'Resolved', value: resolved, color: 'var(--clr-green)', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Rejected', value: rejected, color: 'var(--clr-red)', bg: 'rgba(239,68,68,0.1)' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Summary Cards Grid */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--clr-text)', marginBottom: '1.5rem' }}>
        Overview
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '2rem' }}>
        
        {/* Total Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(37,99,235,0.1)', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📊</div>
             <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--clr-text-2)', fontWeight: 500 }}>Total Complaints</h3>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--clr-text)' }}>{total}</div>
        </div>

        {/* Resolved Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: 'var(--clr-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✅</div>
             <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--clr-text-2)', fontWeight: 500 }}>Resolved</h3>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--clr-text)' }}>{resolved}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-3)', marginTop: '4px' }}>
            {total > 0 ? Math.round((resolved / total) * 100) : 0}% completion rate
          </div>
        </div>

        {/* Pending Action Card (Submitted + Assigned) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', color: 'var(--clr-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>⏳</div>
             <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--clr-text-2)', fontWeight: 500 }}>Pending Review</h3>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--clr-text)' }}>{submitted + assigned}</div>
        </div>

      </div>

      {/* Distribution Chart */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--clr-text)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📈</span> Status Distribution
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {distributionData.map((item) => {
            // Calculate percentage safely
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            
            return (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--clr-text-2)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text)' }}>{item.value} ({Math.round(percentage)}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--clr-border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${percentage}%`, 
                      background: item.color,
                      borderRadius: '4px',
                      transition: 'width 1s ease-in-out'
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
