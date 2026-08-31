// ============================================================
// Premium WinZ Quote Requests Module
// ============================================================
// Features: WinZ quote requests grid view, detailed popup modal,
// automatic read tracking, deletion handling, fully integrated with global themes.
// API: GET, DELETE /api/winz-quotes
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

function WinzQuotes({ token }) {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
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

  const fetchQuotes = async () => {
    setLoading(true)
    const activeToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/winz-quotes`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.quotes || data.data || [])
        setQuotes(list)
      } else {
        showToast('Failed to load quotes', 'error')
      }
    } catch {
      showToast('Server connection failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotes()
  }, [token])

  const handleOpenQuote = async (q) => {
    setSelected(q)
    if (!q.is_read) {
      const activeToken = getActiveToken()
      try {
        await fetch(`${API_BASE}/api/winz-quotes/${q.id}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${activeToken}` },
        })
        setQuotes((prev) => prev.map((item) => (item.id === q.id ? { ...item, is_read: 1 } : item)))
        window.dispatchEvent(new Event('badge-updated'))
      } catch {}
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quote request?')) return
    const activeToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/winz-quotes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      if (res.ok) {
        showToast('Quote deleted successfully', 'success')
        setSelected(null)
        setQuotes((prev) => prev.filter((q) => q.id !== id))
        window.dispatchEvent(new Event('badge-updated'))
      } else {
        showToast('Failed to delete quote', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  return (
    <div className="admin-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="admin-header">
        <h2 className="admin-title">WinZ Quote Requests ({quotes.length})</h2>
      </div>

      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          Loading WinZ quote requests...
        </div>
      ) : quotes.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No quote requests yet</p>
          <span>Incoming quotation requests from the WinZ storefront page will appear here.</span>
        </div>
      ) : (
        <div className="admin-grid-3 contain-content">
          {quotes.map((q) => (
            <div
              className="admin-card"
              key={q.id}
              onClick={() => handleOpenQuote(q)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                margin: 0,
                transition: 'all 0.2s',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{q.name}</h3>
                  <span className={`badge ${q.is_read ? 'badge-default' : 'badge-warning'}`}>
                    {q.is_read ? 'Read' : 'New'}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0 6px' }}>{q.email}</p>
                {q.product_name && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 500, margin: '0 0 6px' }}>
                    Re: {q.product_name}
                  </p>
                )}
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: '6px 0 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.9 }}>
                  {q.message || 'No message provided'}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {q.created_at ? new Date(q.created_at).toLocaleDateString() : 'Recent'}
                </span>
                <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="btn-icon btn-view"
                    onClick={() => handleOpenQuote(q)}
                    title="View Details"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(q.id)}
                    title="Delete Quote"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-container" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>WinZ Quote Request</h3>
              <button className="modal-close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '16px' }}>
                <span className="form-label">Client Name</span>
                <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selected.name}</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span className="form-label">Contact Details</span>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Email: <strong>{selected.email}</strong> {selected.phone ? `• Phone: ${selected.phone}` : ''}
                </p>
              </div>

              {selected.product_name && (
                <div style={{ marginBottom: '16px' }}>
                  <span className="form-label">Product Item</span>
                  <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 600 }}>{selected.product_name}</p>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <span className="form-label">Client Message & Requirements</span>
                <div style={{ background: 'var(--header-bg)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '6px', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                  {selected.message || 'No additional message provided.'}
                </div>
              </div>

              <div>
                <span className="form-label">Submitted On</span>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {selected.created_at ? new Date(selected.created_at).toLocaleString() : 'Recent'}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-action btn-delete" onClick={() => handleDelete(selected.id)}>
                Delete Request
              </button>
              <button className="btn-secondary" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WinzQuotes