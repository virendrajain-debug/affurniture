// ============================================================
// Premium Overview Dashboard Module
// ============================================================
// Features: Dynamic Stats, Recent Enquiries Table, Quick Resolve Modal
// Theme: Wired to global CSS variables for instant theme switching.
// Upgrades: Added Loading State & Safe Data Mapping
// ============================================================

import { useEffect, useState } from 'react'
import { API_BASE } from '../config'

function Overview({ token }) {
  const [stats, setStats] = useState(null)
  const [enquiries, setEnquiries] = useState([])
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true) // Added loading state

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        
        if (res.ok) {
          // Supports both camelCase and snake_case backend payloads
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
    
    if (token) fetchData()
  }, [token])

  const handleView = (enq) => {
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
        // Optimistically update the UI without needing to refetch everything
        setEnquiries(enquiries.map(e => e.id === id ? { ...e, status: 'closed' } : e))
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  // Safe mapping to handle both camelCase and snake_case from your backend
  const counters = [
    { label: 'Total Category', value: stats?.totalCategories ?? stats?.total_categories ?? 0, icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { label: 'Total Products', value: stats?.totalProducts ?? stats?.total_products ?? 0, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Total Enquiry', value: stats?.totalEnquiries ?? stats?.total_enquiries ?? 0, icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { label: 'Total In Stock', value: stats?.inStockProducts ?? stats?.in_stock_products ?? 0, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Out of Stock', value: stats?.outOfStockProducts ?? stats?.out_of_stock_products ?? 0, icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
    { label: 'Contact Enquiry', value: stats?.contactEnquiries ?? stats?.contact_enquiries ?? 0, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '30px', height: '30px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { 
          animation: fadeIn 0.4s ease-out; 
          padding: 24px;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Counter Grid */
        .p-counters-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 40px; }
        .p-counter-card { 
          background: var(--sidebar-bg); 
          border: 1px solid var(--border-color); 
          border-radius: 12px; padding: 24px; 
          display: flex; align-items: center; gap: 20px; 
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); 
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; 
        }
        .p-counter-card:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.3); 
          border-color: var(--accent-color); 
        }
        .p-counter-icon { 
          width: 56px; height: 56px; border-radius: 12px; 
          background: var(--active-bg); color: var(--accent-color); 
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; 
          transition: all 0.3s ease;
        }
        .p-counter-card:hover .p-counter-icon {
          background: var(--accent-color);
          color: #ffffff;
        }
        .p-counter-info { display: flex; flex-direction: column; }
        .p-counter-label { font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .p-counter-value { font-size: 1.85rem; font-weight: 700; color: var(--text-primary); line-height: 1; }

        /* Table Section */
        .recent-section h3 { font-size: 1.25rem; color: var(--text-primary); margin-bottom: 16px; font-weight: 600; letter-spacing: 0.5px; }
        
        .p-table-wrap { 
          background: var(--sidebar-bg); 
          border: 1px solid var(--border-color); 
          border-radius: 12px; overflow: hidden; 
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); margin-top: 16px; 
        }
        .p-data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .p-data-table th { 
          background: var(--header-bg); padding: 16px 20px; font-size: 0.75rem; 
          font-weight: 700; color: var(--text-secondary); text-transform: uppercase; 
          letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color); 
        }
        .p-data-table td { padding: 16px 20px; font-size: 0.9rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); vertical-align: middle; }
        .p-data-table tr:last-child td { border-bottom: none; }
        .p-data-table tbody tr:hover { background: var(--hover-bg); }
        
        .p-order-id { font-family: monospace; color: var(--text-secondary); font-weight: 600; }
        
        .p-action-btn { 
          background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); 
          cursor: pointer; padding: 8px; border-radius: 6px; transition: all 0.2s; 
          display: inline-flex; align-items: center; justify-content: center; 
        }
        .p-action-btn:hover { background: var(--accent-color); color: #fff; border-color: var(--accent-color); }

        /* Dynamic Status Badges */
        .p-badge { padding: 6px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.3px; display: inline-block; }
        .p-badge.pending { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2); }
        .p-badge.closed { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }
        .p-badge.replied { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.2); }

        .p-empty-state { padding: 60px 20px; text-align: center; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .p-empty-state p { margin: 0; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }

        /* Modal Styling */
        .p-modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s ease-out; }
        .p-modal-card { background: var(--sidebar-bg); width: 100%; max-width: 550px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); border: 1px solid var(--border-color); }
        .p-modal-header { background: var(--header-bg); padding: 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
        .p-modal-header h3 { margin: 0; color: var(--text-primary); font-size: 1.25rem; font-weight: 600; letter-spacing: 0.5px; }
        .p-modal-close { background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer; line-height: 1; padding: 0; transition: color 0.2s; }
        .p-modal-close:hover { color: var(--accent-hover); }
        
        .p-modal-body { padding: 24px; }
        .p-detail-row { margin-bottom: 20px; }
        .p-detail-row label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
        .p-detail-row p { margin: 0; font-size: 0.95rem; color: var(--text-primary); line-height: 1.5; }
        
        .p-special-box { background: var(--active-bg); padding: 14px; border-radius: 8px; border: 1px dashed var(--border-color); }
        .p-message-box { background: var(--hover-bg); padding: 16px; border-radius: 8px; white-space: pre-wrap; color: var(--text-primary); border: 1px solid var(--border-color); }
        
        .p-modal-footer { padding: 20px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 12px; background: var(--header-bg); }
        
        .p-btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; }
        .p-btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); }
        .p-btn-outline:hover { background: var(--hover-bg); color: var(--text-primary); }
        .p-btn-primary { background: var(--accent-color); color: #fff; }
        .p-btn-primary:hover { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }

        /* Premium Toast */
        .toast-premium {
          position: fixed; top: 24px; right: 24px; z-index: 9999;
          background: var(--sidebar-bg); border-left: 4px solid var(--accent-color);
          color: var(--text-primary); padding: 16px 24px; border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-weight: 500; font-size: 0.95rem;
          display: flex; align-items: center; gap: 12px; animation: slideInRight 0.3s ease-out;
        }
        .toast-premium.error { border-left-color: #ef4444; }
        .toast-premium.success { border-left-color: #22c55e; }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {toast && (
        <div className={`toast-premium ${toast.type}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {toast.type === 'success' ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </>
            )}
          </svg>
          {toast.msg}
        </div>
      )}

      <div className="p-counters-grid">
        {counters.map((c) => (
          <div className="p-counter-card" key={c.label}>
            <div className="p-counter-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={c.icon} />
              </svg>
            </div>
            <div className="p-counter-info">
              <span className="p-counter-label">{c.label}</span>
              <span className="p-counter-value">{c.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-section">
        <h3>Recent Enquiries</h3>
        
        <div className="p-table-wrap">
          <table className="p-data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Product / Topic</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.length > 0 ? enquiries.map((q) => (
                <tr key={q.id}>
                  <td className="p-order-id">#{q.id}</td>
                  <td style={{ fontWeight: 600 }}>{q.name}</td>
                  <td>{q.email}</td>
                  <td>{q.product_name || 'General Inquiry'}</td>
                  <td>{new Date(q.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`p-badge ${q.status.toLowerCase()}`}>
                      {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="p-action-btn" onClick={() => handleView(q)} title="View details">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7">
                    <div className="p-empty-state">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="3" y1="9" x2="21" y2="9"/>
                        <line x1="9" y1="21" x2="9" y2="9"/>
                      </svg>
                      <p>No queries yet</p>
                      <span>Customer enquiries will appear here once they start coming in.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="p-modal-overlay" onClick={() => setSelected(null)}>
          <div className="p-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="p-modal-header">
              <h3>Enquiry Details</h3>
              <button className="p-modal-close" onClick={() => setSelected(null)}>&times;</button>
            </div>
            
            <div className="p-modal-body">
              <div className="p-detail-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Customer Name</label>
                  <p><strong>{selected.name}</strong></p>
                </div>
                <div>
                  <label>Date Received</label>
                  <p>{new Date(selected.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="p-detail-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Email Address</label>
                  <p>{selected.email}</p>
                </div>
                <div>
                  <label>Phone Number</label>
                  <p>{selected.phone || 'Not provided'}</p>
                </div>
              </div>

              {selected.product_name && (
                <div className="p-detail-row p-special-box">
                  <label>Interested In Product</label>
                  <p style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{selected.product_name}</p>
                </div>
              )}

              <div className="p-detail-row" style={{ marginTop: '20px' }}>
                <label>Message Content</label>
                <p className="p-message-box">
                  {selected.message}
                </p>
              </div>
            </div>

            <div className="p-modal-footer">
              <button className="p-btn p-btn-outline" onClick={() => setSelected(null)}>Close</button>
              {selected.status !== 'closed' && (
                <button className="p-btn p-btn-primary" onClick={() => handleResolve(selected.id)}>Mark as Resolved</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Overview