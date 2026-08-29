// ============================================================
// Premium Finance Applications Module (Theme Engine Enabled)
// ============================================================
// Features: Split-pane review layout, status filter tabs, 
// document download links, status switcher, fully theme-aware.
// API: GET, PUT /:id/status, DELETE /api/finance-applications
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function FinanceApplications({ token }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/finance-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setApplications(data)
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
    if (token) fetchApplications()
  }, [token])

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/finance-applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        showToast('Application status updated', 'success')
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
        if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
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
    try {
      const res = await fetch(`${API_BASE}/api/finance-applications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        showToast('Application deleted successfully', 'success')
        setApplications(prev => prev.filter(a => a.id !== id))
        if (selected?.id === id) setSelected(null)
      } else {
        showToast('Failed to delete application', 'error')
      }
    } catch { 
      showToast('Server error', 'error') 
    }
  }

  // Safe document parsing for JSON string or array responses
  const getDocumentList = (docs) => {
    if (!docs) return []
    if (Array.isArray(docs)) return docs
    try {
      const parsed = JSON.parse(docs)
      return Array.isArray(parsed) ? parsed : [docs]
    } catch {
      return typeof docs === 'string' && docs ? [docs] : []
    }
  }

  const filtered = filter === 'all' ? applications : applications.filter(a => (a.status || 'pending').toLowerCase() === filter)

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.4s ease-out; width: 100%; padding: 24px; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .p-filters-bar { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .p-filter-btn {
          background: var(--sidebar-bg); color: var(--text-secondary); border: 1px solid var(--border-color);
          padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
        }
        .p-filter-btn:hover { background: var(--hover-bg); color: var(--text-primary); }
        .p-filter-btn.active { background: var(--accent-color); color: #fff; border-color: var(--accent-color); }

        .p-split-layout { display: grid; grid-template-columns: 1fr 1.4fr; gap: 24px; align-items: start; }
        @media(max-width: 960px) { .p-split-layout { grid-template-columns: 1fr; } }

        .p-apps-list { display: flex; flex-direction: column; gap: 12px; max-height: 75vh; overflow-y: auto; padding-right: 4px; }
        .p-app-card {
          background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px;
          padding: 18px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.03);
        }
        .p-app-card:hover { border-color: var(--accent-color); transform: translateY(-2px); }
        .p-app-card.selected { border-color: var(--accent-color); background: var(--hover-bg); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .p-app-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .p-app-header strong { color: var(--text-primary); font-size: 1rem; }
        .p-app-email, .p-app-phone { font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0; }
        .p-app-date { font-size: 0.75rem; color: var(--text-secondary); margin-top: 8px; }

        .p-status-badge { padding: 4px 10px; border-radius: 50px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; }
        .p-status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2); }
        .p-status-badge.approved { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }
        .p-status-badge.rejected { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }

        .p-app-detail { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 28px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-detail-title { font-size: 1.15rem; font-weight: 600; color: var(--text-primary); margin: 0 0 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color); }
        .p-detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px; }
        .p-detail-item { display: flex; flex-direction: column; gap: 4px; }
        .p-detail-item.full { grid-column: span 2; }
        .p-detail-item label { font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
        .p-detail-item span { font-size: 0.95rem; color: var(--text-primary); font-weight: 500; }

        .p-detail-docs { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color); }
        .p-detail-docs h3 { font-size: 0.95rem; color: var(--text-primary); margin: 0 0 10px; }
        .p-doc-list { display: flex; gap: 10px; flex-wrap: wrap; }
        .p-doc-link { background: var(--header-bg); border: 1px solid var(--border-color); color: var(--accent-color); padding: 8px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; text-decoration: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .p-doc-link:hover { background: var(--hover-bg); border-color: var(--accent-color); }

        .p-detail-actions { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 12px; background: var(--sidebar-bg); }
        .p-select { padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--header-bg); color: var(--text-primary); font-size: 0.9rem; outline: none; cursor: pointer; }
        
        .p-btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; }
        .p-btn-delete { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .p-btn-delete:hover { background: #ef4444; color: #fff; }

        .page-loading, .empty-state { padding: 60px 20px; text-align: center; color: var(--text-secondary); background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; }
        .empty-state p { margin: 12px 0 4px; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }

        .toast-premium {
          position: fixed; top: 24px; right: 24px; z-index: 9999;
          background: var(--sidebar-bg); border-left: 4px solid var(--accent-color);
          color: var(--text-primary); padding: 16px 24px; border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-weight: 500; font-size: 0.95rem;
          display: flex; align-items: center; gap: 12px; animation: slideInRight 0.3s ease-out;
        }
        .toast-premium.error { border-left-color: #ef4444; }
        .toast-premium.success { border-left-color: #22c55e; }
        .toast-premium.warning { border-left-color: #f59e0b; }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {toast && <div className={`toast-premium ${toast.type}`}>{toast.msg}</div>}

      <div className="p-filters-bar">
        {['all', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} className={`p-filter-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)} {s === 'all' ? `(${applications.length})` : `(${applications.filter(a => (a.status || 'pending').toLowerCase() === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loading">Loading finance applications...</div>
      ) : (
        <div className="p-split-layout">
          <div className="p-apps-list">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <p>No applications found</p>
                <span>No customer finance applications match the selected filter.</span>
              </div>
            ) : filtered.map(app => (
              <div key={app.id} className={`p-app-card ${selected?.id === app.id ? 'selected' : ''}`} onClick={() => setSelected(app)}>
                <div className="p-app-header">
                  <strong>{app.first_name} {app.last_name || ''}</strong>
                  <span className={`p-status-badge ${app.status || 'pending'}`}>{app.status || 'pending'}</span>
                </div>
                <p className="p-app-email">{app.email}</p>
                <p className="p-app-phone">{app.phone}</p>
                <p className="p-app-date">{app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recent'}</p>
              </div>
            ))}
          </div>

          <div className="p-app-detail">
            {selected ? (
              <>
                <h2 className="p-detail-title">Application Details</h2>
                <div className="p-detail-grid">
                  <div className="p-detail-item"><label>First Name</label><span>{selected.first_name}</span></div>
                  <div className="p-detail-item"><label>Last Name</label><span>{selected.last_name || '-'}</span></div>
                  <div className="p-detail-item"><label>Email Address</label><span>{selected.email}</span></div>
                  <div className="p-detail-item"><label>Phone Number</label><span>{selected.phone}</span></div>
                  <div className="p-detail-item full"><label>Address</label><span>{selected.address || '-'}</span></div>
                  <div className="p-detail-item"><label>City</label><span>{selected.city || '-'}</span></div>
                  <div className="p-detail-item"><label>State</label><span>{selected.state || '-'}</span></div>
                  <div className="p-detail-item"><label>Income Source</label><span>{selected.income_source || '-'}</span></div>
                  <div className="p-detail-item full"><label>Products Interested</label><span>{selected.products || '-'}</span></div>
                  <div className="p-detail-item"><label>Status</label><span><span className={`p-status-badge ${selected.status || 'pending'}`}>{selected.status || 'pending'}</span></span></div>
                  <div className="p-detail-item"><label>Applied Date</label><span>{selected.created_at ? new Date(selected.created_at).toLocaleString() : 'Recent'}</span></div>
                </div>

                {getDocumentList(selected.documents).length > 0 && (
                  <div className="p-detail-docs">
                    <h3>Uploaded Supporting Documents</h3>
                    <div className="p-doc-list">
                      {getDocumentList(selected.documents).map((doc, i) => {
                        const fileUrl = doc.startsWith('http') ? doc : `${API_BASE}${doc.startsWith('/') ? '' : '/'}${doc}`
                        return (
                          <a key={i} href={fileUrl} target="_blank" rel="noopener noreferrer" className="p-doc-link">
                            📄 Document {i + 1} ↗
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="p-detail-actions">
                  <select className="p-select" value={selected.status || 'pending'} onChange={(e) => updateStatus(selected.id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button className="p-btn p-btn-delete" onClick={() => deleteApp(selected.id)}>Delete Application</button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>No application selected</p>
                <span>Click on any application card from the list on the left to review details.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FinanceApplications