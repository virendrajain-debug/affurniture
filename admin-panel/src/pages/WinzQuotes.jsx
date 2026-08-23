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
    try {
      const res = await fetch(`${API_BASE}/api/winz-quotes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setQuotes(data)
      }
    } catch {
      showToast('Failed to load quotes', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchQuotes() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this quote request?')) return
    try {
      const res = await fetch(`${API_BASE}/api/winz-quotes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Quote deleted', 'success')
        setSelected(null)
        fetchQuotes()
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  return (
    <div className="categories-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="section-header">
        <h2>WinZ Quote Requests</h2>
        <p>Quote requests from the WinZ page</p>
      </div>

      {loading ? (
        <p style={{ padding: '40px', textAlign: 'center' }}>Loading...</p>
      ) : quotes.length === 0 ? (
        <div className="empty-state"><p>No quote requests yet</p></div>
      ) : (
        <div className="categories-grid">
          {quotes.map(q => (
            <div className="category-card" key={q.id} style={{ display: 'block', padding: '20px', cursor: 'pointer' }} onClick={() => setSelected(q)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{q.name}</h3>
                <span className="status-badge pending" style={{ fontSize: '11px', padding: '2px 8px' }}>{q.status}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 4px' }}>{q.email}</p>
              {q.product_name && <p style={{ fontSize: '13px', color: '#aa7a3e', margin: '0 0 4px' }}>Re: {q.product_name}</p>}
              <p style={{ fontSize: '14px', color: '#555', margin: '8px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.message || 'No message'}</p>
              <p style={{ fontSize: '12px', color: '#999', margin: '8px 0 0' }}>{new Date(q.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="enquiry-modal-overlay" onClick={() => setSelected(null)}>
          <div className="enquiry-modal" onClick={(e) => e.stopPropagation()}>
            <button className="enquiry-modal-close" onClick={() => setSelected(null)}>&times;</button>

            <div className="enquiry-modal-header">
              <div className="enquiry-modal-avatar">{selected.name?.charAt(0)?.toUpperCase()}</div>
              <div>
                <h3>{selected.name}</h3>
                <p>{selected.email}</p>
                {selected.phone && <p style={{ fontSize: '13px', color: '#888' }}>{selected.phone}</p>}
              </div>
              <span className="status-badge pending" style={{ marginLeft: 'auto' }}>{selected.status}</span>
            </div>

            {selected.product_name && (
              <div className="enquiry-modal-product">
                <strong>Product:</strong> {selected.product_name}
              </div>
            )}

            <div className="enquiry-modal-messages">
              <div className="enquiry-msg enquiry-msg-user">
                <span className="enquiry-msg-label">Customer Message</span>
                <p>{selected.message || 'No message provided'}</p>
                <span className="enquiry-msg-time">{new Date(selected.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="enquiry-modal-actions" style={{ padding: '16px 20px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
              <button className="btn-delete-sm" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WinzQuotes
