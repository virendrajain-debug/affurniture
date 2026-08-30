// ============================================================
// Premium Finance Applications Module
// ============================================================
// Features: Split-pane review layout, status filter tabs, 
// document download links, status switcher, fully theme-aware.
// API: GET, PUT /:id/status, DELETE /api/finance-applications
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

function FinanceApplications({ token }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState(null)

  const getActiveToken = () => {
    return (
      getAuthToken(token) ||
      localStorage.getItem('token') ||
      localStorage.getItem('adminToken') ||
      localStorage.getItem('af_admin_token') ||
      ''
    )
  }

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchApplications = async () => {
    setLoading(true)
    const activeToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/finance-applications`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.applications || data.data || [])
        setApplications(list)
      } else {
        showToast('Failed to load applications', 'error')
      }
    } catch { 
      showToast('Server connection failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [token])

  const handleSelectApp = async (app) => {
    setSelected(app)
    if (!app.is_read) {
      const activeToken = getActiveToken()
      try {
        await fetch(`${API_BASE}/api/finance-applications/${app.id}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${activeToken}` },
        })
        setApplications((prev) => prev.map((item) => (item.id === app.id ? { ...item, is_read: 1 } : item)))
        window.dispatchEvent(new Event('badge-updated'))
      } catch {}
    }
  }

  const updateStatus = async (id, status) => {
    const activeToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/finance-applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        showToast('Application status updated', 'success')
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status, is_read: 1 } : a))
        if (selected?.id === id) setSelected(prev => ({ ...prev, status, is_read: 1 }))
        window.dispatchEvent(new Event('badge-updated'))
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to update status', 'error')
      }
    } catch { 
      showToast('Server error', 'error') 
    }
  }

  const deleteApp = async (id) => {
    if (!window.confirm('Are you sure you want to delete this finance application?')) return
    const activeToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/finance-applications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      if (res.ok) {
        showToast('Application deleted successfully', 'success')
        setApplications(prev => prev.filter(a => a.id !== id))
        if (selected?.id === id) setSelected(null)
        window.dispatchEvent(new Event('badge-updated'))
      } else {
        showToast('Failed to delete application', 'error')
      }
    } catch { 
      showToast('Server error', 'error') 
    }
  }

  const filtered = applications.filter(a => {
    if (filter === 'all') return true
    return (a.status || 'pending').toLowerCase() === filter.toLowerCase()
  })

  const getDocumentList = (docs) => {
    if (!docs) return []
    if (Array.isArray(docs)) return docs
    try {
      const parsed = JSON.parse(docs)
      return Array.isArray(parsed) ? parsed : [docs]
    } catch {
      return [docs]
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'badge badge-success'
      case 'rejected':
        return 'badge badge-danger'
      default:
        return 'badge badge-warning'
    }
  }

  return (
    <div className="admin-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="admin-header">
        <h2 className="admin-title">Customer Finance Applications</h2>

        <div className="filter-toolbar" style={{ margin: 0 }}>
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button
              key={s}
              className={filter === s ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} {s === 'all' ? `(${applications.length})` : `(${applications.filter(a => (a.status || 'pending').toLowerCase() === s).length})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          Loading finance applications...
        </div>
      ) : (
        <div className="admin-split-pane contain-content">
          {/* Applications Master List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '75vh', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div className="admin-card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--text-primary)' }}>No applications</p>
                <span style={{ fontSize: '0.8rem' }}>No applications match filter.</span>
              </div>
            ) : filtered.map(app => (
              <div
                key={app.id}
                className="admin-card"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  margin: 0,
                  borderColor: selected?.id === app.id ? 'var(--accent-color)' : 'var(--border-color)',
                  background: selected?.id === app.id ? 'var(--hover-bg)' : 'var(--sidebar-bg)',
                  transition: 'all 0.2s',
                }}
                onClick={() => handleSelectApp(app)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{app.first_name} {app.last_name || ''}</strong>
                  <span className={getStatusBadge(app.status)}>{app.status || 'pending'}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0' }}>{app.email}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0' }}>{app.phone}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                  <button
                    type="button"
                    className="btn-icon btn-delete"
                    style={{ width: '26px', height: '26px' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteApp(app.id)
                    }}
                    title="Delete Application"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '13px', height: '13px' }}>
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Application Detail View */}
          <div className="admin-card">
            {selected ? (
              <>
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Application Details</h3>
                  <span className={getStatusBadge(selected.status)}>{selected.status || 'pending'}</span>
                </div>

                <div className="admin-grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <span className="form-label">First Name</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selected.first_name}</span>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <span className="form-label">Last Name</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selected.last_name || '-'}</span>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <span className="form-label">Email Address</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selected.email}</span>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <span className="form-label">Phone Number</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selected.phone}</span>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2', margin: 0 }}>
                    <span className="form-label">Address</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selected.address || '-'}, {selected.city || ''} {selected.state || ''}</span>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <span className="form-label">Income Source</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selected.income_source || '-'}</span>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <span className="form-label">Applied Date</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selected.created_at ? new Date(selected.created_at).toLocaleString() : 'Recent'}</span>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2', margin: 0 }}>
                    <span className="form-label">Products Interested</span>
                    <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{selected.products || '-'}</span>
                  </div>
                </div>

                {getDocumentList(selected.documents).length > 0 && (
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <span className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Uploaded Documents</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {getDocumentList(selected.documents).map((doc, i) => {
                        const fileUrl = doc.startsWith('http') ? doc : `${API_BASE}${doc.startsWith('/') ? '' : '/'}${doc}`
                        return (
                          <a key={i} href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '6px 12px' }}>
                            📄 Document {i + 1} ↗
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="form-label" style={{ margin: 0 }}>Status:</span>
                    <select
                      className="form-select"
                      style={{ width: 'auto', padding: '6px 12px' }}
                      value={selected.status || 'pending'}
                      onChange={(e) => updateStatus(selected.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <button className="btn-action btn-delete" onClick={() => deleteApp(selected.id)}>
                    Delete Application
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--text-primary)' }}>No application selected</p>
                <span style={{ fontSize: '0.85rem' }}>Select an application from the list to review full details.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FinanceApplications