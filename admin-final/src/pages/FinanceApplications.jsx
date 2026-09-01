// ============================================================
// Phase 5: Finance & WINZ Applications Inbox Manager
// ============================================================
// Single-column, vertical layout inbox data table.
// Displays submissions from the frontend "Apply for Finance" page.
// API: GET /api/finance-applications, PUT /api/finance-applications/:id/status, DELETE /api/finance-applications/:id
// ============================================================

import React, { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

function FinanceApplications({ token }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)

  const authToken = getAuthToken(token)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/finance-applications`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.applications || data.data || [])
        setApplications(list)
      } else {
        showToast('Failed to load finance applications', 'error')
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

  const handleOpen = async (app) => {
    setSelected(app)
    if (app.status === 'pending' || !app.is_read) {
      try {
        await fetch(`${API_BASE}/api/finance-applications/${app.id}/read`, {
          method: 'PUT',
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        })
        setApplications(prev => prev.map(item => item.id === app.id ? { ...item, is_read: 1, status: item.status === 'pending' ? 'read' : item.status } : item))
        window.dispatchEvent(new Event('badge-updated'))
      } catch {}
    }
  }

  const handleUpdateStatus = async (app, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/finance-applications/${app.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        showToast(`Application marked as ${newStatus}`, 'success')
        setApplications(prev => prev.map(item => item.id === app.id ? { ...item, status: newStatus, is_read: 1 } : item))
        if (selected?.id === app.id) setSelected(prev => ({ ...prev, status: newStatus, is_read: 1 }))
        window.dispatchEvent(new Event('badge-updated'))
      }
    } catch {
      showToast('Failed to update status', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this finance application?')) return
    try {
      const res = await fetch(`${API_BASE}/api/finance-applications/${id}`, {
        method: 'DELETE',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      if (res.ok) {
        showToast('Application deleted', 'success')
        setApplications(prev => prev.filter(a => a.id !== id))
        if (selected?.id === id) setSelected(null)
        window.dispatchEvent(new Event('badge-updated'))
      }
    } catch {
      showToast('Server error while deleting', 'error')
    }
  }

  const filtered = applications.filter(a => {
    const q = search.toLowerCase()
    const fullName = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase()
    return (
      fullName.includes(q) ||
      (a.email || '').toLowerCase().includes(q) ||
      (a.phone || '').toLowerCase().includes(q) ||
      (a.products || '').toLowerCase().includes(q) ||
      (a.income_source || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="inbox-page-container">
      <style>{`
        .inbox-page-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px 20px 80px;
          color: var(--text-primary);
        }

        .inbox-header-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .inbox-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0 0 4px;
        }

        .inbox-sub {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .inbox-search {
          padding: 10px 14px;
          background: var(--input-bg, rgba(255,255,255,0.05));
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 0.9rem;
          min-width: 260px;
        }

        .inbox-card {
          background: var(--card-bg, rgba(255, 255, 255, 0.03));
          border: 1px solid var(--border-color);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .inbox-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .inbox-table th {
          padding: 14px 16px;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--border-color);
        }

        .inbox-table td {
          padding: 14px 16px;
          font-size: 0.88rem;
          border-bottom: 1px solid var(--border-color);
          vertical-align: middle;
        }

        .inbox-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .inbox-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .inbox-badge.pending { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .inbox-badge.read { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
        .inbox-badge.approved { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .inbox-badge.declined { background: rgba(156, 163, 175, 0.15); color: #9ca3af; }

        .inbox-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .inbox-btn-sm {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid var(--border-color);
          background: var(--input-bg, rgba(255,255,255,0.05));
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .inbox-btn-sm:hover { background: var(--border-color); }
        .inbox-btn-sm.delete:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
        .inbox-btn-sm.approve:hover { background: #10b981; color: #fff; border-color: #10b981; }

        /* Modal */
        .inbox-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .inbox-modal-box {
          background: var(--card-bg, #1a2238);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          max-width: 650px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .inbox-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 20px;
        }

        .inbox-modal-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 1.4rem;
          cursor: pointer;
        }

        .inbox-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .inbox-modal-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .inbox-modal-field label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 700;
        }

        .inbox-modal-field span, .inbox-modal-field p {
          font-size: 0.92rem;
          margin: 0;
          color: var(--text-primary);
        }

        .inbox-doc-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: var(--accent-color, #d4af37);
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .inbox-doc-pill:hover {
          background: var(--border-color);
        }

        .inbox-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          z-index: 1000;
        }
        .inbox-toast.success { background: #10b981; color: #fff; }
        .inbox-toast.error { background: #ef4444; color: #fff; }
        .inbox-toast.info { background: #3b82f6; color: #fff; }
      `}</style>

      {toast && <div className={`inbox-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="inbox-header-box">
        <div>
          <h2 className="inbox-title">Finance &amp; WINZ Applications ({applications.length})</h2>
          <p className="inbox-sub">Customer submissions from the "Apply for Finance" application portal.</p>
        </div>
        <input
          type="text"
          placeholder="Search by applicant, email, income..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="inbox-search"
        />
      </div>

      <div className="inbox-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading applications...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {search ? 'No matching applications found.' : 'No finance applications submitted yet.'}
          </div>
        ) : (
          <table className="inbox-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Applicant</th>
                <th>Contact</th>
                <th>Income Source</th>
                <th>Requested Items</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => {
                const dateStr = app.created_at ? new Date(app.created_at).toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'
                const status = app.status || (app.is_read ? 'read' : 'pending')
                const fullName = `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'Applicant'
                return (
                  <tr key={app.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{dateStr}</td>
                    <td><strong>{fullName}</strong></td>
                    <td>
                      <div>{app.email}</div>
                      {app.phone && <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{app.phone}</span>}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>{app.income_source || 'Wages / Salary'}</span>
                    </td>
                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.products || 'General Living / Bedroom Package'}
                    </td>
                    <td>
                      <span className={`inbox-badge ${status}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className="inbox-actions">
                        <button type="button" className="inbox-btn-sm" onClick={() => handleOpen(app)}>
                          Review
                        </button>
                        <button type="button" className="inbox-btn-sm approve" onClick={() => handleUpdateStatus(app, 'approved')}>
                          Approve
                        </button>
                        <button type="button" className="inbox-btn-sm delete" onClick={() => handleDelete(app.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {selected && (
        <div className="inbox-modal-overlay" onClick={() => setSelected(null)}>
          <div className="inbox-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="inbox-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Finance Application Review</h3>
              <button className="inbox-modal-close" onClick={() => setSelected(null)}>&times;</button>
            </div>

            <div className="inbox-modal-grid">
              <div className="inbox-modal-field">
                <label>Applicant Name</label>
                <span><strong>{`${selected.first_name || ''} ${selected.last_name || ''}`.trim()}</strong></span>
              </div>
              <div className="inbox-modal-field">
                <label>Submission Date</label>
                <span>{selected.created_at ? new Date(selected.created_at).toLocaleString() : 'N/A'}</span>
              </div>
              <div className="inbox-modal-field">
                <label>Email Address</label>
                <a href={`mailto:${selected.email}`} style={{ color: 'var(--accent-color, #d4af37)' }}>{selected.email}</a>
              </div>
              <div className="inbox-modal-field">
                <label>Phone Number</label>
                <span>{selected.phone || 'Not provided'}</span>
              </div>
              <div className="inbox-modal-field">
                <label>Physical Address</label>
                <span>{selected.address ? `${selected.address}, ${selected.city || ''} ${selected.state || ''}` : 'Auckland, NZ'}</span>
              </div>
              <div className="inbox-modal-field">
                <label>Income / Employment</label>
                <span><strong>{selected.income_source || 'Wages / Salary'}</strong></span>
              </div>
              <div className="inbox-modal-field" style={{ gridColumn: '1 / -1' }}>
                <label>Requested Furniture Items</label>
                <span style={{ color: 'var(--accent-color, #d4af37)', fontWeight: 600 }}>
                  {selected.products || 'Full Home / Bedroom Furniture Package'}
                </span>
              </div>
            </div>

            {/* Uploaded Documents */}
            {selected.documents && selected.documents.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div className="inbox-modal-field" style={{ marginBottom: '8px' }}>
                  <label>Attached Supporting Documents ({selected.documents.length})</label>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selected.documents.map((doc, idx) => (
                    <a key={idx} href={getAssetUrl(doc)} target="_blank" rel="noopener noreferrer" className="inbox-doc-pill">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      Document #{idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <button
                type="button"
                className="inbox-btn-sm delete"
                onClick={() => handleDelete(selected.id)}
              >
                Delete Application
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="inbox-btn-sm approve"
                  onClick={() => handleUpdateStatus(selected, 'approved')}
                >
                  Approve Application
                </button>
                <button
                  type="button"
                  className="inbox-btn-sm"
                  onClick={() => handleUpdateStatus(selected, 'declined')}
                >
                  Decline
                </button>
                <button type="button" className="inbox-btn-sm" onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FinanceApplications;
