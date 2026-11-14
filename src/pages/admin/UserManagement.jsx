import { useMemo, useState } from "react";
import { users as seed } from "../../data/adminRecords.js";
import { Badge, Modal, Toolbar, rowProps, useToast } from "../../components/admin/ui.jsx";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

export default function UserManagement() {
  const [users, setUsers] = useState(seed);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");
  const [selId, setSelId] = useState(seed[0].id);
  const [modal, setModal] = useState(null); // "edit" | "Blocked" | "Deactivated"
  const [form, setForm] = useState({ name: "", email: "" });
  const [toast, say] = useToast();

  const rows = useMemo(() => {
    const t = q.toLowerCase();
    return users.filter((u) => (role === "All" || u.role === role) && (status === "All" || u.status === status)
      && `${u.id} ${u.name} ${u.email}`.toLowerCase().includes(t));
  }, [users, q, role, status]);

  const sel = users.find((u) => u.id === selId);
  const update = (patch) => setUsers((us) => us.map((u) => (u.id === selId ? { ...u, ...patch } : u)));
  const setAccount = (s) => { update({ status: s }); setModal(null); say(`${sel.name}'s account is now ${s.toLowerCase()}`); };
  const openEdit = () => { setForm({ name: sel.name, email: sel.email }); setModal("edit"); };
  const saveEdit = (e) => { e.preventDefault(); update(form); setModal(null); say("Account updated"); };

  return (
    <AdminLayout>
      <main className="ad-content">
        <div className="sn-page">
          <h1>User Management</h1>
          <Toolbar search={q} onSearch={setQ} placeholder="Search name, email or user ID" filters={[
            { label: "Role", value: role, onChange: setRole, options: ["Senior", "Caregiver"] },
            { label: "Status", value: status, onChange: setStatus, options: ["Active", "Blocked", "Deactivated"] },
          ]} />

          <div className="sn-card sn-tablewrap">
            <table className="sn-table">
              <thead><tr><th>User ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} {...rowProps(u.id === selId, () => setSelId(u.id))}>
                    <td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td><Badge>{u.status}</Badge></td><td>{u.joined}</td>
                  </tr>
                ))}
                {!rows.length && <tr><td className="sn-empty" colSpan={6}>No accounts match. Clear the search or filters to see all accounts.</td></tr>}
              </tbody>
            </table>
            <p className="sn-muted">Showing {rows.length} of {users.length} accounts</p>
          </div>

          <section className="sn-card">
            <h3>Account details: {sel.name} <Badge>{sel.status}</Badge></h3>
            <dl className="sn-dl">
              <div><dt>User ID / Role</dt><dd>{sel.id}, {sel.role}</dd></div>
              <div><dt>Contact</dt><dd>{sel.email}<br />{sel.phone}</dd></div>
              <div><dt>Neighborhood</dt><dd>{sel.area}</dd></div>
            </dl>
            <div className="sn-actions">
              <button className="sn-btn" onClick={openEdit}>Edit Account</button>
              {sel.status === "Blocked"
                ? <button className="sn-btn ghost" onClick={() => setAccount("Active")}>Unblock Account</button>
                : <button className="sn-btn ghost danger" onClick={() => setModal("Blocked")}>Block Account</button>}
              {sel.status === "Deactivated"
                ? <button className="sn-btn ghost" onClick={() => setAccount("Active")}>Reactivate Account</button>
                : <button className="sn-btn ghost danger" onClick={() => setModal("Deactivated")}>Deactivate Account</button>}
            </div>
            <p className="sn-muted">Changes are recorded in the account history.</p>
          </section>

          {modal === "edit" && (
            <Modal title="Edit account" onClose={() => setModal(null)} actions={<>
              <button className="sn-btn ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="sn-btn" type="submit" form="edit-account">Save changes</button></>}>
              <form id="edit-account" onSubmit={saveEdit}>
                <label className="sn-field">Full name
                  <input className="sn-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                <label className="sn-field">Email
                  <input className="sn-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              </form>
            </Modal>
          )}
          {(modal === "Blocked" || modal === "Deactivated") && (
            <Modal title={`${modal === "Blocked" ? "Block" : "Deactivate"} ${sel.name}?`} onClose={() => setModal(null)} actions={<>
              <button className="sn-btn ghost" onClick={() => setModal(null)}>Keep account active</button>
              <button className="sn-btn danger" onClick={() => setAccount(modal)}>{modal === "Blocked" ? "Block Account" : "Deactivate Account"}</button></>}>
              <p>You can undo this later from this page.</p>
            </Modal>
          )}
          {toast}
        </div>
      </main>
    </AdminLayout>
  );
}
