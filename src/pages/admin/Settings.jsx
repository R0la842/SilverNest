import { useState } from "react";
import { Switch, useToast } from "../../components/admin/ui.jsx";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

const INITIAL_SETTINGS = {
  categories: [
    { name: "Grocery Shopping", on: true },
    { name: "Pharmacy Pickup", on: true },
    { name: "Light Household Chores", on: true },
    { name: "Companionship Walk", on: true },
    { name: "Gardening Help", on: true },
  ],
  notify: [
    { key: "requests", label: "New assistance requests", hint: "Notify me when a senior or caregiver requests help.", on: true },
    { key: "apps", label: "Volunteer applications", hint: "Alert me when an application needs verification.", on: true },
    { key: "issues", label: "Reported issues", hint: "Receive alerts for new concerns and escalations.", on: true },
    { key: "status", label: "Request status updates", hint: "Get updates when a request is completed or cancelled.", on: false },
    { key: "weekly", label: "Weekly email summary", hint: "Get a Monday report of neighborhood activity.", on: true },
  ],
};

export default function Settings() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [draft, setDraft] = useState(INITIAL_SETTINGS);
  const [newCatName, setNewCatName] = useState("");
  const [error, setError] = useState("");
  const [toast, say] = useToast();

  const isDirty = JSON.stringify(settings) !== JSON.stringify(draft);

  const toggleCategory = (name, on) => {
    setDraft({
      ...draft,
      categories: draft.categories.map((c) => (c.name === name ? { ...c, on } : c)),
    });
  };

  const removeCategory = (name) => {
    setDraft({
      ...draft,
      categories: draft.categories.filter((c) => c.name !== name),
    });
  };

  const toggleNotification = (key, on) => {
    setDraft({
      ...draft,
      notify: draft.notify.map((n) => (n.key === key ? { ...n, on } : n)),
    });
  };

  const addCategory = (e) => {
    e.preventDefault();
    const name = newCatName.trim();
    
    if (!name) return setError("Enter a category name.");
    if (draft.categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return setError("That category already exists.");
    }

    setDraft({
      ...draft,
      categories: [...draft.categories, { name, on: true }],
    });
    setNewCatName("");
    setError("");
  };

  const handleSave = () => {
    setSettings(draft);
    say("Settings saved successfully");
  };

  const handleCancel = () => {
    setDraft(settings);
    setError("");
  };

  return (
    <AdminLayout>
      <main className="ad-content">
        <div className="sn-page">
          <h1>Settings</h1>
          
          <div className="sn-split">
            <section className="sn-card">
              <h3>Assistance Request Categories</h3>
              <p className="sn-muted">Choose which kinds of help seniors can request.</p>
              
              {draft.categories.map((c) => (
                <div className="sn-setting" key={c.name}>
                  <span>{c.name}</span>
                  <span className="sn-row">
                    <Switch checked={c.on} onChange={(v) => toggleCategory(c.name, v)} label={`Enable ${c.name}`} />
                    <button className="sn-link" onClick={() => removeCategory(c.name)} aria-label={`Remove ${c.name}`}>Remove</button>
                  </span>
                </div>
              ))}

              <form className="sn-toolbar" onSubmit={addCategory} style={{ marginTop: 12 }}>
                <input 
                  className="sn-input" 
                  placeholder="New category name" 
                  aria-label="New category name" 
                  value={newCatName} 
                  onChange={(e) => { setNewCatName(e.target.value); setError(""); }} 
                />
                <button className="sn-btn ghost" type="submit">Add Category</button>
              </form>
              
              {error && <p className="sn-muted" role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
            </section>

            <section className="sn-card">
              <h3>Notification Preferences</h3>
              {draft.notify.map((n) => (
                <div className="sn-setting" key={n.key}>
                  <div>
                    <strong>{n.label}</strong>
                    <p>{n.hint}</p>
                  </div>
                  <Switch checked={n.on} onChange={(v) => toggleNotification(n.key, v)} label={n.label} />
                </div>
              ))}
            </section>
          </div>

      
          <div className="sn-actions">
            <p className="sn-muted" style={{ margin: "0 auto 0 0" }}>
              {isDirty ? "You have unsaved changes." : "Your changes will apply after saving."}
            </p>
            <button className="sn-btn ghost" disabled={!isDirty} onClick={handleCancel}>Cancel</button>
            <button className="sn-btn" disabled={!isDirty} onClick={handleSave}>Save Changes</button>
          </div>

          {toast}
        </div>
      </main>
    </AdminLayout>
  );
}