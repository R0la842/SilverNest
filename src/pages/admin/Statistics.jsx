import { useState } from "react";
import { useToast } from "../../components/admin/ui.jsx";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

const COLORS = { Pending: "#f59e0b", Accepted: "#3b82f6", "In Progress": "#8b5cf6", Completed: "#22c55e", Cancelled: "#9ca3af" };
const RANGES = {
  "Last 7 days": { daily: [12, 9, 10, 8, 7, 8, 6], out: { Pending: 8, Accepted: 6, "In Progress": 4, Completed: 38, Cancelled: 4 } },
  "Last 30 days": { daily: [5, 6, 7, 5, 4, 6, 8, 7, 6, 5, 6, 7, 8, 6, 5, 4, 6, 7, 6, 5, 7, 8, 6, 5, 6, 7, 5, 6, 4, 7], out: { Pending: 21, Accepted: 12, "In Progress": 14, Completed: 118, Cancelled: 15 } },
};
// Sample figures for 60 requests; scaled to the selected range.
const CATEGORIES = [
  ["Grocery Shopping", 20, 14, 4.8], ["Pharmacy Pickup", 12, 8, 4.9], ["Companionship Walk", 14, 7, 4.8],
  ["Gardening Help", 8, 5, 4.7], ["Light Household Chores", 6, 4, 4.8],
];

const Stat = ({ label, value }) => <div className="sn-card sn-stat"><strong>{value}</strong><span>{label}</span></div>;

function Area({ data }) {
  const W = 400, H = 140, max = Math.max(...data) * 1.15;
  const line = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * H}`).join(" ");
  return (
    <svg className="sn-area" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Daily requests">
      <polygon points={`0,${H} ${line} ${W},${H}`} fill="rgba(79,70,229,.2)" />
      <polyline points={line} fill="none" stroke="#4f46e5" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Donut({ data, total }) {
  let acc = 0;
  const stops = Object.entries(data).map(([k, v]) => { const from = (acc / total) * 100; acc += v; return `${COLORS[k]} ${from}% ${(acc / total) * 100}%`; });
  return <div className="sn-donut" role="img" aria-label="Request outcomes" style={{ background: `conic-gradient(${stops.join(",")})` }}><div><strong>{total}</strong><small>Requests</small></div></div>;
}

export default function Statistics() {
  const [range, setRange] = useState("Last 7 days");
  const [toast, say] = useToast();
  const { daily, out } = RANGES[range];
  const total = Object.values(out).reduce((a, b) => a + b, 0);
  const rate = Math.round((out.Completed / total) * 100);
  const k = total / 60;

  const exportReport = () => {
    const rows = [["Category", "Requests", "Completed", "Completion rate", "Average rating"],
      ...CATEGORIES.map(([n, r, c, a]) => [n, Math.round(r * k), Math.round(c * k), `${Math.round((c / r) * 100)}%`, a])];
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" })),
      download: `silvernest-report-${range.toLowerCase().replace(/\s/g, "-")}.csv`,
    });
    a.click(); URL.revokeObjectURL(a.href); say("Report exported");
  };

  return (
    <AdminLayout>
      <main className="ad-content">
        <div className="sn-page">
          <h1>Statistics &amp; Reports</h1>
          <div className="sn-toolbar">
            <select className="sn-input" value={range} aria-label="Date range" onChange={(e) => setRange(e.target.value)}>
              {Object.keys(RANGES).map((r) => <option key={r}>{r}</option>)}
            </select>
            <button className="sn-btn" onClick={exportReport}>Export Report</button>
          </div>
          <div className="sn-stats">
            <Stat label="Total Requests" value={total} /><Stat label="Completed Requests" value={out.Completed} />
            <Stat label="Completion Rate" value={`${rate}%`} /><Stat label="Active Volunteers" value={45} />
          </div>
          <div className="sn-split">
            <section className="sn-card"><h3>Daily requests</h3><Area data={daily} /></section>
            <section className="sn-card">
              <h3>Request outcomes</h3>
              <div className="sn-row">
                <Donut data={out} total={total} />
                <ul className="sn-legend">{Object.entries(out).map(([n, v]) => <li key={n}><i style={{ background: COLORS[n] }} />{n}: {v}</li>)}</ul>
              </div>
            </section>
          </div>
          <section className="sn-card sn-tablewrap">
            <h3>Requests by assistance category</h3>
            <table className="sn-table">
              <thead><tr><th>Category</th><th>Requests</th><th>Completed</th><th>Completion rate</th><th>Average rating</th></tr></thead>
              <tbody>{CATEGORIES.map(([n, r, c, a]) => (
                <tr key={n}><td>{n}</td><td>{Math.round(r * k)}</td><td>{Math.round(c * k)}</td><td>{Math.round((c / r) * 100)}%</td><td>{a} / 5</td></tr>
              ))}</tbody>
            </table>
          </section>
          {toast}
        </div>
      </main>
    </AdminLayout>
  );
}
