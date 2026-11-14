import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { stats, weeklyActivity, statusCounts, recentRequests } from '../../data/adminData.js';

function ActivityChart() {
  const width = 420;
  const height = 170;
  const pad = 24;
  const max = Math.max(1,...weeklyActivity.map((d) => d.value));
  const step = (width - pad * 2) / (weeklyActivity.length - 1);
  const points = weeklyActivity.map((d, i) => ({
    x: pad + i * step,
    y: height - pad - (d.value / max) * (height - pad * 2),
    ...d,
  }));
  const line = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <section className="ad-card">
      <h2>Request Activity (Last 7 days)</h2>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="ad-chart"
        role="img"
        aria-label="Requests per day over the last 7 days"
      >
        <polyline points={line} fill="none" stroke="#52509a" strokeWidth="3" />
        {points.map((p) => (
          <g key={p.day}>
            <circle cx={p.x} cy={p.y} r="5" fill="#52509a" />
            <text x={p.x} y={height - 4} textAnchor="middle" fontSize="11" fill="#5d5c80">{p.day}</text>
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fill="#2b2a4c">{p.value}</text>
          </g>
        ))}
      </svg>
    </section>
  );
}

function StatusDonut() {
  const total = statusCounts.reduce((sum, s) => sum + s.value, 0);
  let start = 0;
  const parts = statusCounts.map((s) => {
    const from = start;
    start += (s.value / total) * 100;
    return `${s.color} ${from}% ${start}%`;
  });

  return (
    <section className="ad-card">
      <h2>Request Status</h2>
      <div className="ad-donut-wrap">
        <div
          className="ad-donut"
          style={{ background: `conic-gradient(${parts.join(', ')})` }}
          role="img"
          aria-label="Request status breakdown"
        >
          <div className="ad-donut-hole">
            <strong>{total}</strong>
            <span>Requests</span>
          </div>
        </div>
        <ul className="ad-legend">
          {statusCounts.map((s) => (
            <li key={s.label}>
              <span className="ad-dot" style={{ background: s.color }} />
              {s.label} <strong>{s.value}</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function AdminDashboard() {
  const [statusFilter, setStatusFilter] = useState('All');

  const shown = statusFilter === 'All'
    ? recentRequests
    : recentRequests.filter((r) => r.status === statusFilter);

  return (
    <AdminLayout>
      <main className="ad-content">
        <h1>Dashboard</h1>
        <p className="ad-subtitle">Overview of SilverNest activity.</p>

        <section className="ad-stats" aria-label="Summary">
          {stats.map((s) => (
            <div className="ad-stat" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </section>

        {<div className="ad-grid">
          <ActivityChart />
          {<StatusDonut />}
        </div>}

      </main>
    </AdminLayout>
  );
}