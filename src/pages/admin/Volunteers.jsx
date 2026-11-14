import { useMemo, useState } from "react";
import { volunteers as seed } from "../../data/adminRecords.js";
import { Badge, Toolbar, rowProps, useToast } from "../../components/admin/ui.jsx";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

export default function Volunteers() {
  const [list, setList] = useState(seed);
  const [q, setQ] = useState("");
  const [ver, setVer] = useState("All");
  const [status, setStatus] = useState("All");
  const [selId, setSelId] = useState("V205");
  const [toast, say] = useToast();

  const rows = useMemo(() => {
    const t = q.toLowerCase();
    return list.filter((v) => (ver === "All" || v.verification === ver) && (status === "All" || v.status === status)
      && `${v.id} ${v.name}`.toLowerCase().includes(t));
  }, [list, q, ver, status]);

  const sel = list.find((v) => v.id === selId);
  const decide = (verification, st, msg) => {
    setList((l) => l.map((v) => (v.id === selId ? { ...v, verification, status: st } : v)));
    say(msg);
  };
  const dash = (x, suffix = "") => (x == null ? "-" : `${x}${suffix}`);

  return (
    <AdminLayout>
      <main className="ad-content">
        <div className="sn-page">
          <h1>Volunteers</h1>
          <Toolbar search={q} onSearch={setQ} placeholder="Search volunteer name or ID" filters={[
            { label: "Verification", value: ver, onChange: setVer, options: ["Verified", "Pending review", "Rejected"] },
            { label: "Status", value: status, onChange: setStatus, options: ["Active", "Pending", "Inactive"] },
          ]} />
          <div className="sn-card sn-tablewrap">
            <table className="sn-table">
              <thead><tr><th>Volunteer ID</th><th>Name</th><th>Verification</th><th>Tasks done</th><th>Rating</th><th>Completion</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((v) => (
                  <tr key={v.id} {...rowProps(v.id === selId, () => setSelId(v.id))}>
                    <td>{v.id}</td><td>{v.name}</td><td><Badge>{v.verification}</Badge></td><td>{v.tasks}</td>
                    <td>{dash(v.rating, " / 5")}</td><td>{dash(v.completion, "%")}</td><td><Badge>{v.status}</Badge></td>
                  </tr>
                ))}
                {!rows.length && <tr><td className="sn-empty" colSpan={7}>No volunteers match. Clear the search or filters.</td></tr>}
              </tbody>
            </table>
            <p className="sn-muted">Showing {rows.length} of {list.length} volunteers</p>
          </div>

          <section className="sn-card">
            <h3>{sel.verification === "Pending review" ? "Pending application" : "Volunteer profile"}: {sel.name} <Badge>{sel.verification}</Badge></h3>
            <dl className="sn-dl">
              <div><dt>Neighborhood</dt><dd>{sel.area}</dd></div>
              <div><dt>Availability</dt><dd>{sel.availability}</dd></div>
              <div><dt>Preferred tasks</dt><dd>{sel.prefers}</dd></div>
            </dl>
            <div className="sn-actions">
              {sel.verification === "Pending review" ? (<>
                <button className="sn-btn" onClick={() => decide("Verified", "Active", `${sel.name} approved`)}>Approve Application</button>
                <button className="sn-btn ghost danger" onClick={() => decide("Rejected", "Inactive", `${sel.name}'s application was rejected`)}>Reject Application</button>
              </>) : <p className="sn-muted">This application has already been reviewed.</p>}
              <button className="sn-btn ghost" onClick={() => say("Document viewer is not part of this prototype")}>View verification documents</button>
            </div>
          </section>
          {toast}
        </div>
      </main>
    </AdminLayout>
  );
}
