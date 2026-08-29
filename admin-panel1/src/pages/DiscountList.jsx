// ============================================================
// Premium Discount & Promo Module (Theme Engine Enabled)
// ============================================================
// Features: Discount code CRUD, Active toggle switches, Expiry tracking
// API: GET, POST, PUT, and DELETE /api/discount-codes with Bearer token
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function DiscountList({ token }) {
  const [discounts, setDiscounts] = useState([])
  const [code, setCode] = useState('')
  const [value, setValue] = useState('10%')
  const [type, setType] = useState('percentage')
  const [minOrder, setMinOrder] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchDiscounts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/discount-codes`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setDiscounts(data)
      } else {
        showToast('Failed to load discount codes', 'error')
      }
    } catch {
      showToast('Server connection failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiscounts()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!code.trim()) return showToast('Enter promo code', 'warning')
    if (!value.trim()) return showToast('Enter discount value', 'warning')

    const payload = {
      code: code.trim().toUpperCase(),
      value: value.trim(),
      type,
      min_order: minOrder ? Number(minOrder) : 0,
      max_uses: maxUses ? Number(maxUses) : null,
      expires_at: expiresAt || null,
    }

    try {
      const res = await fetch(`${API_BASE}/api/discount-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showToast('Discount code created successfully', 'success')
        setCode('')
        setValue('10%')
        setType('percentage')
        setMinOrder('')
        setMaxUses('')
        setExpiresAt('')
        fetchDiscounts()
      } else {
        const data = await res.json().catch(() => ({}))
        showToast(data.message || 'Failed to create code', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this discount code?')) return

    try {
      const res = await fetch(`${API_BASE}/api/discount-codes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        showToast('Discount code deleted', 'success')
        setDiscounts((prev) => prev.filter((d) => d.id !== id))
      } else {
        showToast('Failed to delete discount code', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleToggleActive = async (id, currentActive) => {
    const item = discounts.find((d) => d.id === id)
    if (!item) return

    const newActiveState = currentActive ? 0 : 1

    try {
      const res = await fetch(`${API_BASE}/api/discount-codes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...item,
          active: newActiveState,
        }),
      })

      if (res.ok) {
        setDiscounts((prev) =>
          prev.map((d) => (d.id === id ? { ...d, active: newActiveState } : d))
        )
      } else {
        showToast('Failed to update status', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.4s ease-out; padding: 24px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .p-card { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-card h3 { font-size: 1.15rem; color: var(--text-primary); margin: 0 0 16px; font-weight: 600; }

        .p-input-group { margin-bottom: 0; }
        .p-label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
        .p-input, .p-select {
          width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color);
          font-size: 0.9rem; color: var(--text-primary); background: var(--header-bg); box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .p-input:focus, .p-select:focus { outline: none; border-color: var(--accent-color); }

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

        .p-btn { padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .p-btn-primary { background: var(--accent-color); color: #fff; }
        .p-btn-primary:hover { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        
        .btn-sm { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 6px 10px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .btn-sm:hover { background: var(--hover-bg); color: var(--text-primary); }
        .btn-sm.delete:hover { color: #ef4444; border-color: #ef4444; }

        .status-badge { padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; cursor: pointer; }
        .status-badge.active { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }
        .status-badge.pending { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }

        .page-loading, .empty-state { padding: 50px 20px; text-align: center; color: var(--text-secondary); background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; }
        .empty-state p { margin: 0 0 4px; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }

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

      <div className="p-card">
        <h3>Create New Discount Code</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr)) 140px', gap: '14px', alignItems: 'flex-end' }}>
          <div className="p-input-group">
            <label className="p-label">Promo Code *</label>
            <input type="text" placeholder="e.g. SUMMER20" value={code} onChange={(e) => setCode(e.target.value)} className="p-input" />
          </div>
          <div className="p-input-group">
            <label className="p-label">Discount Value *</label>
            <input type="text" placeholder="e.g. 10% or 50" value={value} onChange={(e) => setValue(e.target.value)} className="p-input" />
          </div>
          <div className="p-input-group">
            <label className="p-label">Discount Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="p-select" style={{ cursor: 'pointer' }}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>
          <div className="p-input-group">
            <label className="p-label">Min Order ($)</label>
            <input type="number" placeholder="0" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className="p-input" />
          </div>
          <div className="p-input-group">
            <label className="p-label">Max Uses</label>
            <input type="number" placeholder="Unlimited" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className="p-input" />
          </div>
          <div className="p-input-group">
            <label className="p-label">Expires At</label>
            <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="p-input" />
          </div>
          <button type="submit" className="p-btn p-btn-primary" style={{ height: '45px' }}>Create Code</button>
        </form>
      </div>

      {loading ? (
        <div className="page-loading">Loading discount codes...</div>
      ) : discounts.length === 0 ? (
        <div className="empty-state">
          <p>No discount codes yet</p>
          <span>Create your first promotional code using the form above.</span>
        </div>
      ) : (
        <div className="p-table-wrap">
          <table className="p-data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Value</th>
                <th>Type</th>
                <th>Min Order</th>
                <th>Max Uses</th>
                <th>Expires</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: '600', color: 'var(--accent-color)', fontFamily: 'monospace', fontSize: '1rem' }}>{d.code}</td>
                  <td>{d.value}</td>
                  <td style={{ textTransform: 'capitalize' }}>{d.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}</td>
                  <td>{d.min_order > 0 ? `$${d.min_order}` : 'None'}</td>
                  <td>{d.max_uses ?? 'Unlimited'}</td>
                  <td>{d.expires_at || 'Never'}</td>
                  <td>
                    <span
                      className={`status-badge ${d.active ? 'active' : 'pending'}`}
                      onClick={() => handleToggleActive(d.id, d.active)}
                    >
                      {d.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn-sm delete" onClick={() => handleDelete(d.id)} title="Delete Code">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default DiscountList