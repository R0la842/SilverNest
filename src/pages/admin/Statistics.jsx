import { useState } from "react";
import { useToast } from "../../components/admin/ui.jsx";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

const COLORS = {
  Pending: "#f59e0b",
  Accepted: "#3b82f6",
  "In Progress": "#8b5cf6",
  Completed: "#22c55e",
  Cancelled: "#9ca3af",
};

// Simple mock data 
const STATS_DATA = {
  "Last 7 days": {
    daily: [12, 9, 10, 8, 7, 8, 6],
    outcomes: { Pending: 8, Accepted: 6, "In Progress": 4, Completed: 38, Cancelled: 4 },
    categories: [
      ["Grocery Shopping", 20, 14, 4.8],
      ["Pharmacy Pickup", 12, 8, 4.9],
      ["Companionship Walk", 14, 7, 4.8],
      ["Gardening Help", 8, 5, 4.7],
      ["Light Household Chores", 6, 4, 4.8],
    ]
  },
  "Last 30 days": {
    daily: [5, 6, 7, 5, 4, 6, 8, 7, 6, 5, 6, 7, 8, 6, 5, 4, 6, 7, 6, 5, 7, 8, 6, 5, 6, 7, 5, 6, 4, 7],
    outcomes: { Pending: 21, Accepted: 12, "In Progress": 14, Completed: 118, Cancelled: 15 },
    categories: [
      ["Grocery Shopping", 45, 38, 4.7],
      ["Pharmacy Pickup", 30, 25, 4.9],
      ["Companionship Walk", 32, 26, 4.8],
      ["Gardening Help", 18, 14, 4.6],
      ["Light Household Chores", 25, 20, 4.8],
    ]
  }
};

export default function Statistics() {
  const [range, setRange] = useState("Last 7 days");
  const [toast, say] = useToast();

  const currentData = STATS_DATA[range];
  const total = Object.values(currentData.outcomes).reduce((a, b) => a + b, 0);
  const completed = currentData.outcomes.Completed;
  const rate = Math.round((completed / total) * 100);

  // Fixed SVG line points calculation
  const W = 400;
  const H = 140;
  const maxVal = Math.max(...currentData.daily) * 1.2;
  const points = currentData.daily
    .map((v, i) => `${(i / (currentData.daily.length - 1)) * W},${H - (v / maxVal) * H}`)
    .join(" ");

  const exportReport = () => {
    const headers = ["Category", "Requests", "Completed", "Completion Rate", "Avg Rating"];
    const rows = currentData.categories.map(([name, req, comp, rating]) => [
      name, req, comp, `${Math.round((comp / req) * 100)}%`, rating
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `report-${range.toLowerCase().replace(/\s+/g, "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    say("Report exported successfully!");
  };

  return (
    <AdminLayout>
      <main className="ad-content">
        <div className="sn-page">
          <h1>Statistics & Reports</h1>
          
          <div className="sn-toolbar">
            <select className="sn-input" value={range} onChange={(e) => setRange(e.target.value)}>
              {Object.keys(STATS_DATA).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
            <button className="sn-btn" onClick={exportReport}>Export Report</button>
          </div>

          <div className="sn-stats">
            <div className="sn-card sn-stat"><strong>{total}</strong><span>Total Requests</span></div>
            <div className="sn-card sn-stat"><strong>{completed}</strong><span>Completed Requests</span></div>
            <div className="sn-card sn-stat"><strong>{rate}%</strong><span>Completion Rate</span></div>
            <div className="sn-card sn-stat"><strong>45</strong><span>Active Volunteers</span></div>
          </div>

          <div className="sn-split">
            <section className="sn-card">
              <h3>Daily Requests</h3>
              <svg className="sn-area" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                <polygon points={`0,${H} ${points} ${W},${H}`} fill="rgba(79,70,229,0.15)" />
                <polyline points={points} fill="none" stroke="#4f46e5" strokeWidth="2" />
              </svg>
            </section>

            <section className="sn-card">
              <h3>Request Outcomes</h3>
              <div className="sn-row" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  background: "#e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px"
                }}>
                  <strong>{total}</strong>
                  <small style={{ fontSize: "10px", color: "#64748b" }}>Total</small>
                </div>
                <ul className="sn-legend" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {Object.entries(currentData.outcomes).map(([name, val]) => (
                    <li key={name} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", fontSize: "13px" }}>
                      <span style={{ width: "10px", height: "10px", background: COLORS[name], display: "inline-block", borderRadius: "2px" }} />
                      {name}: {val}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <section className="sn-card sn-tablewrap" style={{ marginTop: "20px" }}>
            <h3>Requests by Assistance Category</h3>
            <table className="sn-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Requests</th>
                  <th>Completed</th>
                  <th>Completion Rate</th>
                  <th>Average Rating</th>
                </tr>
              </thead>
              <tbody>
                {currentData.categories.map(([name, req, comp, rating]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{req}</td>
                    <td>{comp}</td>
                    <td>{Math.round((comp / req) * 100)}%</td>
                    <td>{rating} / 5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {toast}
        </div>
      </main>
    </AdminLayout>
  );
}