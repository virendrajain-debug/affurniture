import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function ActiveEnquiry({ token }) {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchEnquiries = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/enquiries?status=pending`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setEnquiries(data)
      }
    } catch {
      showToast('Failed to load enquiries', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEnquiries() }, [])

  const handleOpen = (enq) => {
    setSelected({ ...enq, message: enq.message || 'No message provided', phone: enq.phone || '' })
  }

  const handleResolve = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/enquiries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'closed' }),
      })
      if (res.ok) {
        showToast('Enquiry closed', 'success')
        setSelected(null)
        fetchEnquiries()
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this enquiry?')) return
    try {
      const res = await fetch(`${API_BASE}/api/enquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Enquiry deleted', 'success')
        setSelected(null)
        fetchEnquiries()
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  return (
    <div className="categories-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="section-header">
        <h2>Active Enquiries</h2>
        <p>Click on any enquiry to view details and reply</p>
      </div>

      {loading ? (
        <p style={{ padding: '40px', textAlign: 'center' }}>Loading...</p>
      ) : enquiries.length === 0 ? (
        <div className="empty-state"><p>No active enquiries</p></div>
      ) : (
        <div className="categories-grid">
          {enquiries.map(enq => (
            <div className="category-card" key={enq.id} style={{ display: 'block', padding: '20px', cursor: 'pointer' }} onClick={() => handleOpen(enq)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ margin: 0 }}>{enq.name}</h3>
                <span className={`status-badge ${enq.status}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                  {enq.status}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 4px' }}>{enq.email}</p>
              {enq.product_name && <p style={{ fontSize: '13px', color: '#aa7a3e', margin: '0 0 4px' }}>Re: {enq.product_name}</p>}
              <p style={{ fontSize: '14px', color: '#555', margin: '8px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{enq.message || 'No message'}</p>
              <p style={{ fontSize: '12px', color: '#999', margin: '8px 0 0' }}>{new Date(enq.created_at).toLocaleDateString()}</p>
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
              <span className={`status-badge ${selected.status}`} style={{ marginLeft: 'auto' }}>{selected.status}</span>
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

              {selected.reply && (
                <div className="enquiry-msg enquiry-msg-admin">
                  <span className="enquiry-msg-label">Admin Reply</span>
                  <p>{selected.reply}</p>
                  {selected.replied_at && <span className="enquiry-msg-time">{new Date(selected.replied_at).toLocaleString()}</span>}
                </div>
              )}
            </div>

            <div className="enquiry-modal-actions" style={{ padding: '16px 20px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => handleResolve(selected.id)}>Mark Resolved</button>
              <button className="btn-delete-sm" onClick={() => handleDelete(selected.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActiveEnquiry
