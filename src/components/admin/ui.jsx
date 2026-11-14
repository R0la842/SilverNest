import { useEffect, useState } from "react";
import "../../pages/admin/admin-pages.css";

const TONE = {
  Active: "green", Verified: "green", Completed: "green", Resolved: "green",
  Accepted: "blue", "In Progress": "blue", "In review": "blue",
  Pending: "amber", "Pending review": "amber", Medium: "amber", Open: "amber",
  Blocked: "red", Rejected: "red", Escalated: "red", High: "red",
};

export const Badge = ({ children }) => <span className={`sn-badge ${TONE[children] || "gray"}`}>{children}</span>;

export const Switch = ({ checked, onChange, label }) => (
  <label className="sn-switch">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
    <span />
  </label>
);

// Props for a clickable, keyboard-friendly table row.
export const rowProps = (selected, onSelect) => ({
  className: selected ? "sel" : "", onClick: onSelect, tabIndex: 0,
  onKeyDown: (e) => e.key === "Enter" && onSelect(),
});

export function Toolbar({ search, onSearch, placeholder, filters = [] }) {
  return (
    <div className="sn-toolbar">
      <input className="sn-input" type="search" placeholder={placeholder} value={search} aria-label={placeholder} onChange={(e) => onSearch(e.target.value)} />
      {filters.map((f) => (
        <select key={f.label} className="sn-input" value={f.value} aria-label={f.label} onChange={(e) => f.onChange(e.target.value)}>
          <option value="All">{f.label}: All</option>
          {f.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ))}
    </div>
  );
}

export function Modal({ title, onClose, actions, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="sn-overlay" onClick={onClose}>
      <div className="sn-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
        <div className="sn-actions">{actions}</div>
      </div>
    </div>
  );
}

// const [toast, say] = useToast();  ->  render {toast}, call say("Saved")
export function useToast() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 2500);
    return () => clearTimeout(t);
  }, [msg]);
  return [msg ? <div className="sn-toast" role="status">{msg}</div> : null, setMsg];
}
