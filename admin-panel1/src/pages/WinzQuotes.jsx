// ============================================================
// Premium WinZ Quote Requests Module (Theme Engine Enabled)
// ============================================================
// Features: WinZ quote requests grid view, detailed popup modal,
// deletion handling, fully integrated with global themes.
// API: GET, DELETE /api/winz-quotes
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function WinzQuotes({ token }) {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchQuotes = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/winz-quotes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setQuotes(data)
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
    if (token) fetchQuotes()
  }, [token])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quote request?')) return
    try {
      const res = await fetch(`${API_BASE}/api/winz-quotes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Quote deleted successfully', 'success')
        setSelected(null)
        setQuotes(prev => prev.filter(q => q.id !== id))
      } else {
        showToast('Failed to delete quote', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.4s ease-out; width: 100%; padding: 24px; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .p-enquiries-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .p-enquiry-card {
          background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px;
          padding: 20px; cursor: pointer; transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03); display: flex; flex-direction: column; justify-content: space-between;
        }
        .p-enquiry-card:hover { transform: translateY(-2px); border-color: var(--accent-color); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
        
        .p-enquiry-card h3 { margin: 0; color: var(--text-primary); font-size: 1.05rem; font-weight: 600; }
        .p-enquiry-email { font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 6px; }
        .p-enquiry-product { font-size: 0.85rem; color: var(--accent-color); font-weight: 500; margin: 0 0 6px; }
        .p-enquiry-msg { font-size: 0.9rem; color: var(--text-primary); margin: 6px 0 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: 0.9; }
        .p-enquiry-date { font-size: 0.75rem; color: var(--text-secondary); margin: 0; }

        .p-status-badge { padding: 4px 10px; border-radius: 50px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; }
        .p-status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2); }

        .page-loading, .empty-state { padding: 60px 20px; text-align: center; color: var(--text-secondary); background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; }
        .empty-state p { margin: 12px 0 4px; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }

        .p-modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .p-modal-card { background: var(--sidebar-bg); width: 100%; max-width: 600px; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); border: 1px solid var(--border-color); animation: modalIn 0.3s ease-out; }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        
        .p-modal-header { background: var(--header-bg); padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; position: relative; }
        .p-modal-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-color), var(--accent-hover)); color: #fff; font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .p-modal-header h3 { margin: 0 0 2px; color: var(--text-primary); font-size: 1.15rem; font-weight: 600; }
        .p-modal-header p { margin: 0; font-size: 0.85rem; color: var(--text-secondary); }
        .p-modal-close { position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer; line-height: 1; transition: color 0.2s; }
        .p-modal-close:hover { color: #ef4444; }

        .p-modal-body { padding: 24px; overflow-y: auto; max-height: 60vh; }
        .p-modal-product { background: var(--header-bg); padding: 12px 16px; border-radius: 8px; border: 1px dashed var(--border-color); margin-bottom: 16px; font-size: 0.9rem; color: var(--text-primary); }
        .p-modal-product strong { color: var(--accent-color); }

        .p-modal-messages { display: flex; flex-direction: column; gap: 14px; }
        .p-msg-box { background: var(--header-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px; }
        .p-msg-label { font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px; }
        .p-msg-box p { margin: 0 0 8px; font-size: 0.95rem; color: var(--text-primary); line-height: 1.5; white-space: pre-wrap; }
        .p-msg-time { font-size: 0.75rem; color: var(--text-secondary); display: block; text-align: right; }

        .p-modal-footer { padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 12px; background: var(--header-bg); }
        
        .p-btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; }
        .p-btn-delete { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .p-btn-delete:hover { background: #ef4444; color: #fff; }

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

      {loading ? (
        <div className="page-loading">Loading WinZ quote requests...</div>
      ) : quotes.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <p>No quote requests yet</p>
          <span>Incoming quotation requests from the WinZ page will appear here.</span>
        </div>
      ) : (
        <div className="p-enquiries-grid">
          {quotes.map(q => (
            <div className="p-enquiry-card" key={q.id} onClick={() => setSelected(q)}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <h3>{q.name}</h3>
                  <span className={`p-status-badge ${q.status || 'pending'}`}>
                    {q.status || 'pending'}
                  </span>
                </div>
                <p className="p-enquiry-email">{q.email}</p>
                {q.product_name && <p className="p-enquiry-product">Re: {q.product_name}</p>}
                <p className="p-enquiry-msg">{q.message || 'No message provided'}</p>
              </div>
              <p className="p-enquiry-date">{q.created_at ? new Date(q.created_at).toLocaleDateString() : 'Recent'}</p>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="p-modal-overlay" onClick={() => setSelected(null)}>
          <div className="p-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="p-modal-header">
              <div className="p-modal-avatar">{selected.name?.charAt(0)?.toUpperCase()}</div>
              <div>
                <h3>{selected.name}</h3>
                <p>{selected.email} {selected.phone ? `• ${selected.phone}` : ''}</p>
              </div>
              <button className="p-modal-close" onClick={() => setSelected(null)}>&times;</button>
            </div>

            <div className="p-modal-body">
              {selected.product_name && (
                <div className="p-modal-product">
                  <strong>Interested In Product:</strong> {selected.product_name}
                </div>
              )}

              <div className="p-modal-messages">
                <div className="p-msg-box">
                  <span className="p-msg-label">Customer Message</span>
                  <p>{selected.message || 'No message provided'}</p>
                  <span className="p-msg-time">{selected.created_at ? new Date(selected.created_at).toLocaleString() : 'Recent'}</span>
                </div>
              </div>
            </div>

            <div className="p-modal-footer">
              <button className="p-btn p-btn-delete" onClick={() => handleDelete(selected.id)}>Delete Quote Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WinzQuotes