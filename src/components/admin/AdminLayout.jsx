import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import '../../pages/admin/admin.css';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/volunteers', label: 'Volunteers' },
  { to: '/admin/requests', label: 'Requests' },
  { to: '/admin/issues', label: 'Reported Issues' },
  { to: '/admin/statistics', label: 'Statistics' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="ad-shell">
      <button
        type="button"
        className="ad-menu-btn"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰ Menu
      </button>

      <aside className={`ad-sidebar ${menuOpen ? 'open' : ''}`}>
        <Link to="/admin" className="ad-brand">SilverNest</Link>
        <p className="ad-workspace">Admin Portal</p>

        <nav className="ad-nav" aria-label="Admin navigation">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => 'ad-link' + (isActive ? ' active' : '')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/login" className="ad-link ad-logout">Log Out</Link>
      </aside>

      
      <div className="ad-main">
        <header className="ad-topbar">
          {/* search box goes here */}

          {/* bell goes here */}

          <div className="ad-user">
            <span className="ad-avatar" aria-hidden="true">A</span>
            <span>
              <strong>Admin User</strong>
              <small>Administrator</small>
            </span>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}