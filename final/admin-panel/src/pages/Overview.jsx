// ============================================================
// Premium Overview Dashboard Module
// ============================================================
// Features: Dynamic Real DB Stats Counters linking to sub-pages,
// Recent Inquiries Table, Quick Resolve Action Modal.
// ============================================================

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

function Overview({ token }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [enquiries, setEnquiries] = useState([])
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  const authToken = getAuthToken(token)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/dashboard`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        const data = await res.json()
        
        if (res.ok) {
          setStats(data.stats || data) 
          setEnquiries(data.recentEnquiries || data.recent_enquiries || [])
        } else {
          showToast('Failed to load dashboard data', 'error')
        }
      } catch {
        showToast('Server connection failed', 'error')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [token])

  const handleView = (enq) => {
    setSelected({ ...enq, message: enq.message || 'No message provided', phone: enq.phone || '' })
  }

  const handleResolve = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/enquiries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ status: 'closed' }),
      })
      if (res.ok) {
        showToast('Enquiry marked as resolved', 'success')
        setSelected(null)
        setEnquiries(enquiries.map(e => e.id === id ? { ...e, status: 'closed' } : e))
        window.dispatchEvent(new Event('badge-updated'))
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const counters = [
    {
      label: 'Total Products',
      path: '/dashboard/products',
      value: stats?.totalProducts ?? 0,
      subtext: `${stats?.inStockProducts ?? 0} In Stock • ${stats?.outOfStockProducts ?? 0} Out of Stock`,
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
      label: 'Active Categories',
      path: '/dashboard/categories',
      value: stats?.totalCategories ?? 0,
      subtext: 'Catalog & Storefront Navigation',
      icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    },
    {
      label: 'Customer Enquiries',
      path: '/dashboard/customer-enquiries',
      value: stats?.totalEnquiries ?? 0,
      subtext: `${stats?.pendingEnquiries ?? 0} Pending Response`,
      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    },
    {
      label: 'Contact Messages',
      path: '/dashboard/contact-enquiries',
      value: stats?.contactEnquiries ?? 0,
      subtext: 'General Contact Submissions',
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    },
    {
      label: 'WinZ Quotes',
      path: '/dashboard/winz-quotes',
      value: stats?.winzQuotes ?? 0,
      subtext: `${stats?.pendingWinzQuotes ?? 0} Pending Review`,
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      label: 'Finance Applications',
      path: '/dashboard/finance-applications',
      value: stats?.financeApplications ?? 0,
      subtext: `${stats?.pendingFinance ?? 0} Pending Processing`,
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  ]

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

      <div className="admin-header">
        <h2 className="admin-title">Store Operations & Performance</h2>
      </div>

      {/* Counters Grid */}
      <div className="admin-grid-3" style={{ marginBottom: '24px' }}>
        {counters.map((c, i) => (
          <div
            key={i}
            className="admin-card stat-card interactive"
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              margin: 0,
              padding: '20px',
            }}
            onClick={() => navigate(c.path)}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'var(--hover-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-color)',
                flexShrink: 0,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={c.icon} />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                {c.label}
              </span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, display: 'block' }}>
                {c.value}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {c.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Customer Inquiries */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Recent Customer Enquiries</h3>
          <button
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            onClick={() => navigate('/dashboard/customer-enquiries')}
          >
            View All Enquiries →
          </button>
        </div>
        
        <div className="table-container contain-content">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Topic / Product</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                    Loading data...
                  </td>
                </tr>
              ) : enquiries.length > 0 ? (
                enquiries.map((q) => (
                  <tr key={q.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>#{q.id}</td>
                    <td>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{q.name}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>{q.email}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: q.product_name ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                        {q.product_name || 'General Inquiry'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(q.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={getStatusBadge(q.status)}>
                        {q.status || 'pending'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-action btn-edit" onClick={() => handleView(q)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No customer enquiries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-container" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Enquiry #{selected.id} Details</h3>
              <button className="modal-close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="admin-grid-2">
                <div>
                  <span className="form-label">Customer</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{selected.name}</p>
                </div>
                <div>
                  <span className="form-label">Date</span>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="admin-grid-2">
                <div>
                  <span className="form-label">Email</span>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-primary)' }}>{selected.email}</p>
                </div>
                <div>
                  <span className="form-label">Phone</span>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-primary)' }}>{selected.phone || '—'}</p>
                </div>
              </div>

              {selected.product_name && (
                <div style={{ background: 'var(--header-bg)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span className="form-label">Enquired Product</span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--accent-color)' }}>{selected.product_name}</p>
                </div>
              )}

              <div>
                <span className="form-label">Message</span>
                <div style={{ margin: '4px 0 0', background: 'var(--header-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                  {selected.message}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
              {selected.status !== 'closed' && (
                <button className="btn-primary" onClick={() => handleResolve(selected.id)}>Mark as Resolved</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Overview
