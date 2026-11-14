import { useMemo, useState } from "react";
import { issues as seed } from "../../data/adminRecords.js";
import { Badge, Toolbar, rowProps, useToast } from "../../components/admin/ui.jsx";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

export default function ReportedIssues() {
  const [list, setList] = useState(seed);
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState("All");
  const [status, setStatus] = useState("All");
  const [selId, setSelId] = useState("I001");
  const [notes, setNotes] = useState({ I001: [{ text: "Contacted Sarah. Pickup is scheduled for 11:00 AM.", at: "10 Oct 2026, 10:42 AM" }] });
  const [draft, setDraft] = useState("");
  const [toast, say] = useToast();

  const rows = useMemo(() => {
    const t = q.toLowerCase();
    return list.filter((i) => (priority === "All" || i.priority === priority) && (status === "All" || i.status === status)
      && `${i.id} ${i.title} ${i.reporter}`.toLowerCase().includes(t));
  }, [list, q, priority, status]);

  const sel = list.find((i) => i.id === selId);
  const unresolved = list.filter((i) => i.status !== "Resolved").length;
  const escalated = list.filter((i) => i.status === "Escalated").length;
  const patch = (p, msg) => { setList((l) => l.map((i) => (i.id === selId ? { ...i, ...p } : i))); say(msg); };
  const addNote = () => {
    if (!draft.trim()) return;
    setNotes((n) => ({ ...n, [selId]: [...(n[selId] || []), { text: draft.trim(), at: new Date().toLocaleString() }] }));
    setDraft(""); say("Note added");
  };

  return (
    <AdminLayout>
      <main className="ad-content">
        <div className="sn-page">
          <h1>Reported Issues</h1>
          <p className="sn-muted">{unresolved} unresolved, {escalated} escalated</p>
          <Toolbar search={q} onSearch={setQ} placeholder="Search issue, reporter or request" filters={[
            { label: "Priority", value: priority, onChange: setPriority, options: ["High", "Medium", "Low"] },
            { label: "Status", value: status, onChange: setStatus, options: ["Open", "In review", "Escalated", "Resolved"] },
          ]} />
          <div className="sn-card sn-tablewrap">
            <table className="sn-table">
              <thead><tr><th>Issue ID</th><th>Issue</th><th>Reported by</th><th>Request</th><th>Priority</th><th>Status</th><th>Reported</th></tr></thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id} {...rowProps(i.id === selId, () => setSelId(i.id))}>
                    <td>#{i.id}</td><td>{i.title}</td><td>{i.reporter}</td><td>#{i.requestId}</td><td><Badge>{i.priority}</Badge></td><td><Badge>{i.status}</Badge></td><td>{i.date}</td>
                  </tr>
                ))}
                {!rows.length && <tr><td className="sn-empty" colSpan={7}>No issues match. Clear the search or filters.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="sn-split">
            <section className="sn-card">
              <h3>Issue details: #{sel.id} <Badge>{sel.status}</Badge></h3>
              <dl className="sn-dl">
                <div><dt>Reported by / Linked request</dt><dd>{sel.reporter}, #{sel.requestId}</dd></div>
                <div><dt>Priority</dt><dd><Badge>{sel.priority}</Badge></dd></div>
                <div><dt>Description</dt><dd>{sel.detail}</dd></div>
              </dl>
              <div className="sn-actions">
                <button className="sn-btn" disabled={sel.status === "Resolved"} onClick={() => patch({ status: "Resolved" }, `Issue #${sel.id} resolved`)}>Resolve Issue</button>
                <button className="sn-btn ghost danger" disabled={["Resolved", "Escalated"].includes(sel.status)} onClick={() => patch({ status: "Escalated", priority: "High" }, `Issue #${sel.id} escalated`)}>Escalate Issue</button>
              </div>
            </section>
            <section className="sn-card">
              <h3>Internal notes</h3>
              <ul className="sn-notes">
                {(notes[selId] || []).map((n, k) => <li key={k}>{n.text}<br /><small>{n.at}</small></li>)}
                {!(notes[selId] || []).length && <li>No notes yet. Add an update for the admin team below.</li>}
              </ul>
              <textarea className="sn-input" rows={2} aria-label="Write an update for the admin team" placeholder="Write an update for the admin team" value={draft} onChange={(e) => setDraft(e.target.value)} />
              <div className="sn-actions"><button className="sn-btn ghost" disabled={!draft.trim()} onClick={addNote}>Add Note</button></div>
            </section>
          </div>
          {toast}
        </div>
      </main>
    </AdminLayout>
  );
}
