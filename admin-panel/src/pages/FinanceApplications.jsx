import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function FinanceApplications({ token }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/finance-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setApplications(Array.isArray(data) ? data : [])
    } catch { setApplications([]) }
    setLoading(false)
  }

  useEffect(() => { fetchApplications() }, [])

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE}/api/finance-applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      })
      fetchApplications()
      if (selected?.id === id) setSelected({ ...selected, status })
    } catch { alert('Failed to update status') }
  }

  const deleteApp = async (id) => {
    if (!confirm('Delete this application?')) return
    try {
      await fetch(`${API_BASE}/api/finance-applications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setApplications(applications.filter(a => a.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch { alert('Failed to delete') }
  }

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter)
  const statusColors = { pending: '#f39c12', approved: '#27ae60', rejected: '#e74c3c' }

  if (loading) return <div className="page-loading">Loading...</div>

  return (
    <div className="finance-apps-page">
      <div className="page-header">
        <h1>Finance Applications</h1>
        <div className="page-filters">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} className={`filter-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)} {s === 'all' ? `(${applications.length})` : `(${applications.filter(a => a.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="finance-apps-layout">
        <div className="apps-list">
          {filtered.length === 0 ? (
            <div className="empty-state">No applications found</div>
          ) : filtered.map(app => (
            <div key={app.id} className={`app-card ${selected?.id === app.id ? 'selected' : ''}`} onClick={() => setSelected(app)}>
              <div className="app-card-header">
                <strong>{app.first_name} {app.last_name || ''}</strong>
                <span className="status-badge" style={{ background: statusColors[app.status] || '#999' }}>{app.status}</span>
              </div>
              <p className="app-card-email">{app.email}</p>
              <p className="app-card-phone">{app.phone}</p>
              <p className="app-card-date">{new Date(app.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>

        <div className="app-detail">
          {selected ? (
            <>
              <h2>Application Details</h2>
              <div className="detail-grid">
                <div><label>First Name</label><span>{selected.first_name}</span></div>
                <div><label>Last Name</label><span>{selected.last_name || '-'}</span></div>
                <div><label>Email</label><span>{selected.email}</span></div>
                <div><label>Phone</label><span>{selected.phone}</span></div>
                <div className="full-width"><label>Address</label><span>{selected.address || '-'}</span></div>
                <div><label>City</label><span>{selected.city || '-'}</span></div>
                <div><label>State</label><span>{selected.state || '-'}</span></div>
                <div><label>Income Source</label><span>{selected.income_source || '-'}</span></div>
                <div className="full-width"><label>Products</label><span>{selected.products || '-'}</span></div>
                <div><label>Status</label><span className="status-badge" style={{ background: statusColors[selected.status] || '#999' }}>{selected.status}</span></div>
                <div><label>Applied</label><span>{new Date(selected.created_at).toLocaleString()}</span></div>
              </div>

              {selected.documents && selected.documents.length > 0 && (
                <div className="detail-documents">
                  <h3>Uploaded Documents</h3>
                  <div className="doc-list">
                    {selected.documents.map((doc, i) => (
                      <a key={i} href={`${API_BASE}${doc}`} target="_blank" rel="noopener noreferrer" className="doc-link">
                        Document {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-actions">
                <select value={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button className="delete-btn" onClick={() => deleteApp(selected.id)}>Delete</button>
              </div>
            </>
          ) : (
            <div className="empty-state">Select an application to view details</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FinanceApplications
