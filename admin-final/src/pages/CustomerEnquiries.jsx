// ============================================================
// Phase 5: Customer & Product Enquiries Inbox Manager
// ============================================================
// Single-column, vertical layout inbox data table.
// Displays submissions from product enquiry popups & catalog quote forms.
// API: GET /api/enquiries?type=product, PUT /api/enquiries/:id/status, DELETE /api/enquiries/:id
// ============================================================

import React, { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

function CustomerEnquiries({ token }) {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)

  const authToken = getAuthToken(token)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchEnquiries = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/enquiries?type=product`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.enquiries || data.data || [])
        setEnquiries(list)
      } else {
        showToast('Failed to load customer enquiries', 'error')
      }
    } catch {
      showToast('Server connection failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnquiries()
  }, [token])

  const handleOpen = async (enq) => {
    setSelected(enq)
    if (enq.status === 'pending' || !enq.is_read) {
      try {
        await fetch(`${API_BASE}/api/enquiries/${enq.id}/read`, {
          method: 'PUT',
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        })
        setEnquiries(prev => prev.map(item => item.id === enq.id ? { ...item, is_read: 1, status: item.status === 'pending' ? 'read' : item.status } : item))
        window.dispatchEvent(new Event('badge-updated'))
      } catch {}
    }
  }

  const handleToggleStatus = async (enq, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/enquiries/${enq.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        showToast(`Enquiry marked as ${newStatus}`, 'success')
        setEnquiries(prev => prev.map(item => item.id === enq.id ? { ...item, status: newStatus, is_read: 1 } : item))
        if (selected?.id === enq.id) setSelected(prev => ({ ...prev, status: newStatus, is_read: 1 }))
        window.dispatchEvent(new Event('badge-updated'))
      }
    } catch {
      showToast('Failed to update status', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return
    try {
      const res = await fetch(`${API_BASE}/api/enquiries/${id}`, {
        method: 'DELETE',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      if (res.ok) {
        showToast('Enquiry deleted', 'success')
        setEnquiries(prev => prev.filter(e => e.id !== id))
        if (selected?.id === id) setSelected(null)
        window.dispatchEvent(new Event('badge-updated'))
      }
    } catch {
      showToast('Server error while deleting', 'error')
    }
  }

  const filtered = enquiries.filter(e => {
    const q = search.toLowerCase()
    return (
      (e.name || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.phone || '').toLowerCase().includes(q) ||
      (e.product_name || '').toLowerCase().includes(q) ||
      (e.message || '').toLowerCase().includes(q)
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
          overflow-x: auto;
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
        .inbox-badge.resolved { background: rgba(16, 185, 129, 0.15); color: #10b981; }

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
        .inbox-btn-sm.resolve:hover { background: #10b981; color: #fff; border-color: #10b981; }

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
          max-width: 600px;
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

        .inbox-modal-message-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 14px;
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 20px;
          white-space: pre-wrap;
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
          <h2 className="inbox-title">Customer &amp; Product Enquiries ({enquiries.length})</h2>
          <p className="inbox-sub">Submissions from product pages and customer interest forms.</p>
        </div>
        <input
          type="text"
          placeholder="Search by product, customer, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="inbox-search"
        />
      </div>

      <div className="inbox-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading enquiries...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {search ? 'No matching enquiries found.' : 'No customer enquiries received yet.'}
          </div>
        ) : (
          <table className="inbox-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Requested Item</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((enq) => {
                const dateStr = enq.created_at ? new Date(enq.created_at).toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'
                const status = enq.status || (enq.is_read ? 'read' : 'pending')
                return (
                  <tr key={enq.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{dateStr}</td>
                    <td><strong>{enq.name || 'Anonymous'}</strong></td>
                    <td>
                      <div>{enq.email}</div>
                      {enq.phone && <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{enq.phone}</span>}
                    </td>
                    <td>
                      <span style={{ color: 'var(--accent-color, #d4af37)', fontWeight: 600 }}>
                        {enq.product_name || 'General Product Enquiry'}
                      </span>
                    </td>
                    <td>
                      <span className={`inbox-badge ${status}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className="inbox-actions">
                        <button type="button" className="inbox-btn-sm" onClick={() => handleOpen(enq)}>
                          View
                        </button>
                        {status !== 'resolved' ? (
                          <button type="button" className="inbox-btn-sm resolve" onClick={() => handleToggleStatus(enq, 'resolved')}>
                            Resolve
                          </button>
                        ) : (
                          <button type="button" className="inbox-btn-sm" onClick={() => handleToggleStatus(enq, 'pending')}>
                            Reopen
                          </button>
                        )}
                        <button type="button" className="inbox-btn-sm delete" onClick={() => handleDelete(enq.id)}>
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
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Product Enquiry Details</h3>
              <button className="inbox-modal-close" onClick={() => setSelected(null)}>&times;</button>
            </div>

            <div className="inbox-modal-grid">
              <div className="inbox-modal-field">
                <label>Customer Name</label>
                <span><strong>{selected.name || 'Anonymous'}</strong></span>
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
              <div className="inbox-modal-field" style={{ gridColumn: '1 / -1' }}>
                <label>Product of Interest</label>
                <span style={{ color: 'var(--accent-color, #d4af37)', fontWeight: 700 }}>
                  {selected.product_name || 'General Inventory Item'}
                </span>
              </div>
              {(selected.size || selected.size_price) ? (
                <div className="inbox-modal-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Requested Size</label>
                  <span>
                    {selected.size || 'Not specified'}
                    {selected.size_price ? ` — $${Number(selected.size_price).toLocaleString()}` : ''}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="inbox-modal-field" style={{ marginBottom: '8px' }}>
              <label>Customer Notes &amp; Message</label>
            </div>
            <div className="inbox-modal-message-box">
              {selected.message || 'Customer requested pricing / availability without extra notes.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <button
                type="button"
                className="inbox-btn-sm delete"
                onClick={() => handleDelete(selected.id)}
              >
                Delete Enquiry
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                {selected.status !== 'resolved' ? (
                  <button
                    type="button"
                    className="inbox-btn-sm resolve"
                    onClick={() => handleToggleStatus(selected, 'resolved')}
                  >
                    Mark as Resolved
                  </button>
                ) : (
                  <button
                    type="button"
                    className="inbox-btn-sm"
                    onClick={() => handleToggleStatus(selected, 'pending')}
                  >
                    Mark as Unresolved
                  </button>
                )}
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

export default CustomerEnquiries;
