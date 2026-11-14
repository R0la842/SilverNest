import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { requests as seed, volunteers } from "../../data/adminRecords.js";
import { Badge, Modal, Toolbar, rowProps, useToast } from "../../components/admin/ui.jsx";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

const TYPES = ["Grocery Shopping", "Pharmacy Pickup", "Companionship Walk", "Gardening Help", "Light Household Chores"];
const STATUSES = ["Pending", "Accepted", "In Progress", "Completed", "Cancelled"];
const verified = volunteers.filter((v) => v.verification === "Verified").map((v) => v.name);

export default function Requests() {
  const [items, setItems] = useState(seed);
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("search") || ""); // filled by the top-bar search box
  useEffect(() => setQ(params.get("search") || ""), [params]);
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [selId, setSelId] = useState("R002");
  const [edit, setEdit] = useState(null);     // draft for the Update Request modal
  const [reason, setReason] = useState(null); // text of the cancel card (null = card closed)
  const [toast, say] = useToast();

  const rows = useMemo(() => {
    const t = q.toLowerCase();
    return items.filter((r) => (status === "All" || r.status === status) && (type === "All" || r.type === type)
      && `${r.id} ${r.type} ${r.senior} ${r.volunteer || ""}`.toLowerCase().includes(t));
  }, [items, q, status, type]);

  const sel = items.find((r) => r.id === selId);
  const editable = !["Completed", "Cancelled"].includes(sel.status);
  const patch = (p) => setItems((l) => l.map((r) => (r.id === selId ? { ...r, ...p } : r)));
  const select = (id) => { setSelId(id); setReason(null); };
  const saveEdit = () => { patch(edit); setEdit(null); say("Request updated"); };
  const confirmCancel = () => { patch({ status: "Cancelled", cancelReason: reason.trim() }); setReason(null); say("Request cancelled"); };

  return (
    <AdminLayout>
      <main className="ad-content">
        <div className="sn-page">
          <h1>Requests Management</h1>
          <Toolbar search={q} onSearch={setQ} placeholder="Search request ID or task" filters={[
            { label: "Status", value: status, onChange: setStatus, options: STATUSES },
            { label: "Task type", value: type, onChange: setType, options: TYPES },
          ]} />
          <div className="sn-card sn-tablewrap">
            <table className="sn-table">
              <thead><tr><th>Request ID</th><th>Task type</th><th>Requested by</th><th>Volunteer</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} {...rowProps(r.id === selId, () => select(r.id))}>
                    <td>{r.id}</td><td>{r.type}</td><td>{r.senior}</td><td>{r.volunteer || "Unassigned"}</td><td>{r.date}</td><td><Badge>{r.status}</Badge></td>
                  </tr>
                ))}
                {!rows.length && <tr><td className="sn-empty" colSpan={6}>No requests match. Clear the search or filters.</td></tr>}
              </tbody>
            </table>
            <p className="sn-muted">Showing {rows.length} of {items.length} requests</p>
          </div>

          <div className="sn-split">
            <section className="sn-card">
              <h3>Request details: #{sel.id} <Badge>{sel.status}</Badge></h3>
              <dl className="sn-dl">
                <div><dt>Senior / Location</dt><dd>{sel.senior}<br />{sel.address}</dd></div>
                <div><dt>Task / Scheduled time</dt><dd>{sel.type}<br />{sel.date}, {sel.time}</dd></div>
                <div><dt>Volunteer</dt><dd>{sel.volunteer || "Unassigned"}</dd></div>
                {sel.notes && <div><dt>Notes</dt><dd>{sel.notes}</dd></div>}
                {sel.cancelReason && <div><dt>Cancellation reason</dt><dd>{sel.cancelReason}</dd></div>}
              </dl>
              <div className="sn-actions">
                <button className="sn-btn" disabled={!editable} onClick={() => setEdit({ volunteer: sel.volunteer, status: sel.status })}>Update Request</button>
                <button className="sn-btn ghost danger" disabled={!editable} onClick={() => setReason("")}>Cancel Request</button>
              </div>
              {!editable && <p className="sn-muted">Completed and cancelled requests can't be changed.</p>}
            </section>

            {reason !== null && (
              <section className="sn-card">
                <h3>Cancel this request?</h3>
                <label className="sn-field" htmlFor="cancel-reason">Reason for cancellation</label>
                <textarea id="cancel-reason" className="sn-input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: senior no longer needs assistance" />
                <div className="sn-actions">
                  <button className="sn-btn ghost" onClick={() => setReason(null)}>Keep Request</button>
                  <button className="sn-btn danger" disabled={!reason.trim()} onClick={confirmCancel}>Confirm Cancel</button>
                </div>
              </section>
            )}
          </div>

          {edit && (
            <Modal title={`Update request #${sel.id}`} onClose={() => setEdit(null)} actions={<>
              <button className="sn-btn ghost" onClick={() => setEdit(null)}>Discard</button>
              <button className="sn-btn" onClick={saveEdit}>Save changes</button></>}>
              <label className="sn-field">Assigned volunteer
                <select className="sn-input" value={edit.volunteer || ""} onChange={(e) => setEdit({ ...edit, volunteer: e.target.value || null })}>
                  <option value="">Unassigned</option>{verified.map((n) => <option key={n}>{n}</option>)}
                </select></label>
              <label className="sn-field">Status
                <select className="sn-input" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                  {STATUSES.slice(0, 4).map((s) => <option key={s}>{s}</option>)}
                </select></label>
            </Modal>
          )}
          {toast}
        </div>
      </main>
    </AdminLayout>
  );
}
