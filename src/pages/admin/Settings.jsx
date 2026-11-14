import { useState } from "react";
import { Switch, useToast } from "../../components/admin/ui.jsx";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

const START = {
  categories: ["Grocery Shopping", "Pharmacy Pickup", "Light Household Chores", "Companionship Walk", "Gardening Help"].map((name) => ({ name, on: true })),
  notify: [
    { key: "requests", label: "New assistance requests", hint: "Notify me when a senior or caregiver requests help.", on: true },
    { key: "apps", label: "Volunteer applications", hint: "Alert me when an application needs verification.", on: true },
    { key: "issues", label: "Reported issues", hint: "Receive alerts for new concerns and escalations.", on: true },
    { key: "status", label: "Request status updates", hint: "Get updates when a request is completed or cancelled.", on: false },
    { key: "weekly", label: "Weekly email summary", hint: "Get a Monday report of neighborhood activity.", on: true },
  ],
};

export default function Settings() {
  const [saved, setSaved] = useState(START);
  const [draft, setDraft] = useState(START);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [toast, say] = useToast();
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);

  const toggleCat = (n, on) => setDraft((d) => ({ ...d, categories: d.categories.map((c) => (c.name === n ? { ...c, on } : c)) }));
  const removeCat = (n) => setDraft((d) => ({ ...d, categories: d.categories.filter((c) => c.name !== n) }));
  const toggleNote = (key, on) => setDraft((d) => ({ ...d, notify: d.notify.map((x) => (x.key === key ? { ...x, on } : x)) }));
  const addCat = (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return setError("Enter a category name.");
    if (draft.categories.some((c) => c.name.toLowerCase() === n.toLowerCase())) return setError("That category already exists.");
    setDraft((d) => ({ ...d, categories: [...d.categories, { name: n, on: true }] }));
    setName(""); setError("");
  };
  const save = () => { setSaved(draft); say("Settings saved"); };

  return (
    <AdminLayout>
      <main className="ad-content">
        <div className="sn-page">
          <h1>Settings</h1>
          <div className="sn-split">
            <section className="sn-card">
              <h3>Assistance request categories</h3>
              <p className="sn-muted">Choose which kinds of help seniors can request.</p>
              {draft.categories.map((c) => (
                <div className="sn-setting" key={c.name}>
                  <span>{c.name}</span>
                  <span className="sn-row">
                    <Switch checked={c.on} onChange={(v) => toggleCat(c.name, v)} label={`Enable ${c.name}`} />
                    <button className="sn-link" onClick={() => removeCat(c.name)} aria-label={`Remove ${c.name}`}>Remove</button>
                  </span>
                </div>
              ))}
              <form className="sn-toolbar" onSubmit={addCat} style={{ marginTop: 12 }}>
                <input className="sn-input" placeholder="New category name" aria-label="New category name" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} />
                <button className="sn-btn ghost" type="submit">Add Category</button>
              </form>
              {error && <p className="sn-muted" role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
            </section>
            <section className="sn-card">
              <h3>Notification preferences</h3>
              {draft.notify.map((n) => (
                <div className="sn-setting" key={n.key}>
                  <div><strong>{n.label}</strong><p>{n.hint}</p></div>
                  <Switch checked={n.on} onChange={(v) => toggleNote(n.key, v)} label={n.label} />
                </div>
              ))}
            </section>
          </div>
          <div className="sn-actions">
            <p className="sn-muted" style={{ margin: "0 auto 0 0" }}>{dirty ? "You have unsaved changes." : "Your changes will apply after saving."}</p>
            <button className="sn-btn ghost" disabled={!dirty} onClick={() => setDraft(saved)}>Cancel</button>
            <button className="sn-btn" disabled={!dirty} onClick={save}>Save Changes</button>
          </div>
          {toast}
        </div>
      </main>
    </AdminLayout>
  );
}
