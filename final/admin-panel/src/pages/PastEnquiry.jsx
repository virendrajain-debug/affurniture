// ============================================================
// Premium Past Enquiries Module (Theme Engine Enabled)
// ============================================================
// Features: Resolved and closed customer inquiries grid view, 
// detailed popup modal with admin reply history, deletion handling.
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function PastEnquiry({ token }) {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchEnquiries = async () => {
    setLoading(true)
    try {
      let combined = []
      const res = await fetch(`${API_BASE}/api/enquiries?status=replied`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) combined = [...data]
      }
      
      const res2 = await fetch(`${API_BASE}/api/enquiries?status=closed`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res2.ok) {
        const data2 = await res2.json()
        if (Array.isArray(data2)) combined = [...combined, ...data2]
      }
      
      setEnquiries(combined)
    } catch {
      showToast('Failed to load past enquiries', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchEnquiries()
  }, [token])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return
    try {
      const res = await fetch(`${API_BASE}/api/enquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Enquiry deleted successfully', 'success')
        setSelected(null)
        fetchEnquiries()
      } else {
        showToast('Failed to delete enquiry', 'error')
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
        .p-enquiry-msg { font-size: 0.9rem; color: var(--text-primary); margin: 6px 0 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: 0.8; }
        .p-enquiry-date { font-size: 0.75rem; color: var(--text-secondary); margin: 0; }

        .p-status-badge { padding: 4px 10px; border-radius: 50px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; }
        .p-status-badge.replied { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.2); }
        .p-status-badge.closed { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }

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
      `}</style>

      {toast && <div className={`toast-premium ${toast.type}`}>{toast.msg}</div>}

      {loading ? (
        <div className="page-loading">Loading past enquiries...</div>
      ) : enquiries.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <p>No past enquiries</p>
          <span>Resolved and closed customer enquiries will appear here.</span>
        </div>
      ) : (
        <div className="p-enquiries-grid">
          {enquiries.map(enq => (
            <div className="p-enquiry-card" key={enq.id} onClick={() => setSelected(enq)}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <h3>{enq.name}</h3>
                  <span className={`p-status-badge ${enq.status}`}>
                    {enq.status}
                  </span>
                </div>
                <p className="p-enquiry-email">{enq.email}</p>
                {enq.product_name && <p className="p-enquiry-product">Re: {enq.product_name}</p>}
                <p className="p-enquiry-msg">{enq.message || 'No message provided'}</p>
              </div>
              <p className="p-enquiry-date">{new Date(enq.created_at).toLocaleDateString()}</p>
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
                  <span className="p-msg-time">{new Date(selected.created_at).toLocaleString()}</span>
                </div>

                {selected.reply && (
                  <div className="p-msg-box" style={{ background: 'var(--sidebar-bg)' }}>
                    <span className="p-msg-label">Admin Reply</span>
                    <p>{selected.reply}</p>
                    {selected.replied_at && <span className="p-msg-time">{new Date(selected.replied_at).toLocaleString()}</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="p-modal-footer">
              <button className="p-btn p-btn-delete" onClick={() => handleDelete(selected.id)}>Delete Enquiry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PastEnquiry