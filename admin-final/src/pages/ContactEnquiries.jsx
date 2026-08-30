// ============================================================
// Premium Contact Form Enquiries Module
// ============================================================
// Dedicated management for inquiries submitted through the storefront
// Contact Us form (GET /api/enquiries?type=contact).
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

function ContactEnquiries({ token }) {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
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

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchContactEnquiries = async () => {
    setLoading(true)
    const activeToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/enquiries?type=contact`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.enquiries || data.data || [])
        setEnquiries(list)
      } else {
        showToast('Failed to load contact submissions', 'error')
      }
    } catch {
      showToast('Server connection failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContactEnquiries()
  }, [token])

  const handleOpen = async (enq) => {
    setSelected({ ...enq, message: enq.message || 'No message provided', phone: enq.phone || '' })
    setReplyText(enq.reply || '')

    if (!enq.is_read) {
      const activeToken = getActiveToken()
      try {
        await fetch(`${API_BASE}/api/enquiries/${enq.id}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${activeToken}` },
        })
        setEnquiries((prev) => prev.map((item) => (item.id === enq.id ? { ...item, is_read: 1 } : item)))
        window.dispatchEvent(new Event('badge-updated'))
      } catch {}
    }
  }

  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return showToast('Please enter a reply message', 'warning')

    const activeToken = getActiveToken()
    setSubmittingReply(true)
    try {
      const res = await fetch(`${API_BASE}/api/enquiries/${selected.id}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ reply: replyText.trim() }),
      })

      if (res.ok) {
        showToast('Reply sent successfully', 'success')
        setSelected((prev) => (prev ? { ...prev, reply: replyText.trim(), status: 'replied', is_read: 1 } : null))
        fetchContactEnquiries()
        window.dispatchEvent(new Event('badge-updated'))
      } else {
        const errData = await res.json().catch(() => ({}))
        showToast(errData.message || 'Failed to send reply', 'error')
      }
    } catch {
      showToast('Server error while sending reply', 'error')
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    const activeToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/enquiries/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        showToast(`Status updated to ${newStatus}`, 'success')
        setSelected((prev) => (prev && prev.id === id ? { ...prev, status: newStatus, is_read: 1 } : prev))
        fetchContactEnquiries()
        window.dispatchEvent(new Event('badge-updated'))
      } else {
        showToast('Failed to update status', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact submission?')) return
    const activeToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/enquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      if (res.ok) {
        showToast('Contact submission deleted', 'success')
        if (selected?.id === id) setSelected(null)
        fetchContactEnquiries()
        window.dispatchEvent(new Event('badge-updated'))
      } else {
        showToast('Failed to delete submission', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const filtered = enquiries.filter((enq) => {
    const s = enq.status?.toLowerCase() || 'pending'
    const matchStatus = statusFilter === 'all' ? true : s === statusFilter
    const q = search.toLowerCase().trim()
    const matchSearch =
      q === '' ||
      enq.name?.toLowerCase().includes(q) ||
      enq.email?.toLowerCase().includes(q) ||
      enq.message?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const counts = {
    all: enquiries.length,
    pending: enquiries.filter((e) => (e.status?.toLowerCase() || 'pending') === 'pending').length,
    replied: enquiries.filter((e) => e.status?.toLowerCase() === 'replied').length,
    closed: enquiries.filter((e) => e.status?.toLowerCase() === 'closed').length,
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'replied':
        return 'badge badge-info'
      case 'closed':
        return 'badge badge-success'
      default:
        return 'badge badge-warning'
    }
  }

  return (
    <div className="admin-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="admin-card">
        <div className="admin-header" style={{ marginBottom: '16px' }}>
          <h2 className="admin-title">Storefront Contact Messages</h2>

          {/* Status Tabs */}
          <div className="filter-toolbar" style={{ margin: 0 }}>
            {['all', 'pending', 'replied', 'closed'].map((tab) => (
              <button
                key={tab}
                className={statusFilter === tab ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                onClick={() => setStatusFilter(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="filter-toolbar" style={{ margin: 0 }}>
          <input
            type="text"
            className="search-box"
            placeholder="Search by customer name, email, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="table-container contain-content">
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading contact submissions...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              No messages found
            </p>
            <span style={{ fontSize: '0.85rem' }}>No submissions match your active filter.</span>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Sender</th>
                <th>Contact Info</th>
                <th>Message Snippet</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((enq) => (
                <tr key={enq.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    #{enq.id}
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{enq.name}</strong>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{enq.email}</div>
                    {enq.phone && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{enq.phone}</div>}
                  </td>
                  <td>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        maxWidth: '320px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {enq.message}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(enq.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={getStatusBadge(enq.status)}>
                      {enq.status || 'pending'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn-icon btn-reply"
                        onClick={() => handleOpen(enq)}
                        title="View & Reply"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(enq.id)}
                        title="Delete Contact Enquiry"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Interactive Detail & Reply Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Contact Message #{selected.id}</h3>
              <button className="modal-close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="admin-grid-2">
                <div>
                  <span className="form-label">Sender Name</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{selected.name}</p>
                </div>
                <div>
                  <span className="form-label">Date Submitted</span>
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="admin-grid-2">
                <div>
                  <span className="form-label">Email Address</span>
                  <p style={{ margin: '4px 0 0' }}>
                    <a href={`mailto:${selected.email}`} style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 500 }}>
                      {selected.email}
                    </a>
                  </p>
                </div>
                <div>
                  <span className="form-label">Phone Number</span>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-primary)' }}>{selected.phone || 'Not provided'}</p>
                </div>
              </div>

              <div>
                <span className="form-label">Message Content</span>
                <div style={{ background: 'var(--header-bg)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '4px', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                  {selected.message}
                </div>
              </div>

              {selected.reply && (
                <div>
                  <span className="form-label" style={{ color: '#22c55e' }}>Previous Reply</span>
                  <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.25)', padding: '12px 16px', borderRadius: '8px', marginTop: '4px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {selected.reply}
                  </div>
                </div>
              )}

              <form onSubmit={handleSendReply}>
                <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>
                  {selected.reply ? 'Send Follow-up Reply' : 'Send Email Reply to Sender'}
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Type your response to the sender..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => handleStatusChange(selected.id, 'closed')}
                    >
                      Mark as Closed
                    </button>
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => handleStatusChange(selected.id, 'pending')}
                    >
                      Mark as Pending
                    </button>
                  </div>

                  <button type="submit" className="btn-primary" disabled={submittingReply}>
                    {submittingReply ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactEnquiries
