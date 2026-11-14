        <section className="ad-card">
          <div className="ad-card-head">
            <h2>Recent Requests</h2>
            <div className="ad-card-tools">
              <label htmlFor="ad-status-filter" className="ad-sr-only">Filter by status</label>
              <select
                id="ad-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                {statusCounts.map((s) => <option key={s.label}>{s.label}</option>)}
              </select>
              <Link to="/admin/requests" className="ad-view-all">View All</Link>
            </div>
          </div>

          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Request ID</th><th>Task Type</th><th>Volunteer</th><th>Date</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.length === 0 ? (
                  <tr><td colSpan="5">No requests found.</td></tr>
                ) : (
                  shown.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.task}</td>
                      <td>{r.volunteer}</td>
                      <td>{r.date}</td>
                      <td>
                        <span className={`ad-badge ad-badge-${r.status.replace(' ', '').toLowerCase()}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>