import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function DiscountList({ token }) {
  const [discounts, setDiscounts] = useState([])
  const [code, setCode] = useState('')
  const [value, setValue] = useState('10%')
  const [type, setType] = useState('percentage')
  const [minOrder, setMinOrder] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetchDiscounts()
  }, [])

  const fetchDiscounts = () => {
    fetch(`${API_BASE}/api/discount-codes`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setDiscounts(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!code.trim()) return showToast('Enter discount code', 'warning')
    try {
      const res = await fetch(`${API_BASE}/api/discount-codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: code.trim(), value, type, min_order: minOrder ? Number(minOrder) : 0, expires_at: expiresAt || null }),
      })
      if (res.ok) {
        showToast('Discount code created', 'success')
        setCode('')
        setValue('10%')
        setType('percentage')
        setMinOrder('')
        setExpiresAt('')
        fetchDiscounts()
      } else {
        const data = await res.json()
        showToast(data.message || 'Failed to create', 'error')
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
        setDiscounts(discounts.filter(d => d.id !== id))
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  const handleToggleActive = async (id, currentActive) => {
    try {
      const discount = discounts.find(d => d.id === id)
      const res = await fetch(`${API_BASE}/api/discount-codes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...discount, active: currentActive ? 0 : 1 }),
      })
      if (res.ok) {
        fetchDiscounts()
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  return (
    <div className="categories-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="section-header">
        <h2>Discount & Promo</h2>
        <p>Create and manage discount codes for checkout</p>
      </div>

      <form className="add-form" onSubmit={handleAdd} style={{ flexWrap: 'wrap' }}>
        <input type="text" placeholder="Code (e.g. SUMMER20)" value={code} onChange={(e) => setCode(e.target.value)} style={{ flex: '1 1 180px' }} />
        <input type="text" placeholder="Value (e.g. 10%)" value={value} onChange={(e) => setValue(e.target.value)} style={{ flex: '1 1 120px' }} />
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ flex: '1 1 140px', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #c5d5e8', fontSize: '14px', background: '#f8fafd', cursor: 'pointer' }}>
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed Amount ($)</option>
        </select>
        <input type="number" placeholder="Min order ($)" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} style={{ flex: '1 1 120px' }} />
        <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} style={{ flex: '1 1 150px' }} />
        <button type="submit" className="btn-primary">Create Code</button>
      </form>

      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : discounts.length === 0 ? (
        <div className="empty-state"><p>No discount codes yet</p><span>Create your first discount code above</span></div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Value</th>
                <th>Type</th>
                <th>Min Order</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: '600', color: '#2a3f6e' }}>{d.code}</td>
                  <td>{d.value}</td>
                  <td style={{ textTransform: 'capitalize' }}>{d.type === 'percentage' ? 'Percentage' : 'Fixed'}</td>
                  <td>{d.min_order > 0 ? `$${d.min_order}` : '-'}</td>
                  <td>{d.expires_at || '-'}</td>
                  <td>
                    <span
                      className={`status-badge ${d.active ? 'active' : 'pending'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggleActive(d.id, d.active)}
                    >
                      {d.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn-sm delete" onClick={() => handleDelete(d.id)} title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
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
