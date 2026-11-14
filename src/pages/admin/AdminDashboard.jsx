import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { stats } from '../../data/adminData.js';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <main className="ad-content">
        <h1>Dashboard</h1>
        <p className="ad-subtitle">Overview of SilverNest activity.</p>

        <section className="ad-stats" aria-label="Summary">
          {stats.map((s) => (
            <div className="ad-stat" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </section>

        {/* charts go here */}

        {/* table goes here */}
      </main>
    </AdminLayout>
  );
}