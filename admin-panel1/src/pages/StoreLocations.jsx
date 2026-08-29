// ============================================================
// Premium Store Locations Management Module (Theme Engine Enabled)
// ============================================================
// Features: Store location CRUD, Google map embed config, 
// active/inactive indicators, fully integrated with global themes.
// API: GET /api/store-locations/all, POST, PUT /:id, DELETE /:id
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function StoreLocations({ token }) {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    google_map_url: '',
    latitude: '',
    longitude: '',
    description: '',
    sort_order: 0,
    active: 1,
  })
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchLocations = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/store-locations/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setLocations(data)
      } else {
        showToast('Failed to load store locations', 'error')
      }
    } catch {
      showToast('Server connection failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchLocations()
  }, [token])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm({
      ...form,
      [name]: type === 'checkbox' ? (e.target.checked ? 1 : 0) : value,
    })
  }

  const resetForm = () => {
    setForm({
      name: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      google_map_url: '',
      latitude: '',
      longitude: '',
      description: '',
      sort_order: 0,
      active: 1,
    })
    setEditing(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      return showToast('Location name is required', 'warning')
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      sort_order: Number(form.sort_order) || 0,
      active: form.active ? 1 : 0,
    }

    try {
      const url = editing
        ? `${API_BASE}/api/store-locations/${editing.id}`
        : `${API_BASE}/api/store-locations`
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showToast(
          editing ? 'Location updated successfully' : 'Location created successfully',
          'success'
        )
        fetchLocations()
        resetForm()
      } else {
        const data = await res.json().catch(() => ({}))
        showToast(data.message || 'Failed to save location', 'error')
      }
    } catch {
      showToast('Server error while saving location', 'error')
    }
  }

  const handleEdit = (loc) => {
    setEditing(loc)
    setForm({
      name: loc.name || '',
      address: loc.address || '',
      city: loc.city || '',
      phone: loc.phone || '',
      email: loc.email || '',
      google_map_url: loc.google_map_url || '',
      latitude: loc.latitude || '',
      longitude: loc.longitude || '',
      description: loc.description || '',
      sort_order: loc.sort_order || 0,
      active: loc.active ? 1 : 0,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this store location?')) return
    try {
      const res = await fetch(`${API_BASE}/api/store-locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('Store location deleted', 'success')
        setLocations((prev) => prev.filter((loc) => loc.id !== id))
      } else {
        showToast('Failed to delete location', 'error')
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

        .p-action-bar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .p-action-bar h2 { font-size: 1.5rem; color: var(--text-primary); margin: 0 0 4px 0; font-weight: 600; }
        .p-action-bar p { color: var(--text-secondary); margin: 0; font-size: 0.9rem; }

        .p-table-wrap { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .p-data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .p-data-table th { background: var(--header-bg); padding: 16px 20px; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid var(--border-color); }
        .p-data-table td { padding: 16px 20px; font-size: 0.9rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); vertical-align: middle; }
        .p-data-table tr:last-child td { border-bottom: none; }
        .p-data-table tbody tr:hover { background: var(--hover-bg); }

        .p-status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
        .p-status-dot.active { background: #4ade80; box-shadow: 0 0 8px rgba(74, 222, 128, 0.4); }
        .p-status-dot.inactive { background: #94a3b8; }

        .p-action-btn { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-right: 8px; }
        .p-action-btn:hover { background: var(--hover-bg); color: var(--text-primary); border-color: var(--accent-color); }
        .p-action-btn.delete:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }

        .p-modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .p-modal-card { background: var(--sidebar-bg); width: 100%; max-width: 650px; max-height: 90vh; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); border: 1px solid var(--border-color); animation: modalIn 0.3s ease-out; }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        
        .p-modal-header { background: var(--header-bg); padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
        .p-modal-header h3 { margin: 0; color: var(--text-primary); font-size: 1.15rem; font-weight: 600; }
        
        .p-modal-body { padding: 24px; overflow-y: auto; }
        .p-form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .p-input-group { display: flex; flex-direction: column; gap: 6px; }
        .p-input-group.full { grid-column: span 2; }
        .p-label { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; }
        .p-input { padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; color: var(--text-primary); background: var(--header-bg); outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.2s; }
        .p-input:focus { border-color: var(--accent-color); }
        textarea.p-input { resize: vertical; }

        .p-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.95rem; color: var(--text-primary); font-weight: 500; margin-top: 10px; }
        .p-checkbox-label input { width: 18px; height: 18px; accent-color: var(--accent-color); cursor: pointer; }

        .p-modal-footer { padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 12px; background: var(--header-bg); }
        
        .p-btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; }
        .p-btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); }
        .p-btn-outline:hover { background: var(--hover-bg); color: var(--text-primary); }
        .p-btn-primary { background: var(--accent-color); color: #fff; }
        .p-btn-primary:hover { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }

        .page-loading, .empty-state { padding: 60px 20px; text-align: center; color: var(--text-secondary); background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 12px; }
        .empty-state p { margin: 12px 0 4px; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }

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
      `}</style>

      {toast && <div className={`toast-premium ${toast.type}`}>{toast.msg}</div>}

      <div className="p-action-bar">
        <div>
          <h2>Store Locations</h2>
          <p>Manage physical storefront locations, contact details, and map embeds.</p>
        </div>
        <button
          className="p-btn p-btn-primary"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          + Add Location
        </button>
      </div>

      {showForm && (
        <div className="p-modal-overlay" onClick={resetForm}>
          <div className="p-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="p-modal-header">
              <h3>{editing ? 'Edit Store Location' : 'Add New Store Location'}</h3>
              <button
                onClick={resetForm}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-modal-body">
                <div className="p-form-grid">
                  <div className="p-input-group">
                    <label className="p-label">Location Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="p-input"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Downtown Flagship"
                      required
                    />
                  </div>
                  <div className="p-input-group">
                    <label className="p-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="p-input"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="e.g. Auckland"
                    />
                  </div>
                  <div className="p-input-group full">
                    <label className="p-label">Full Address</label>
                    <input
                      type="text"
                      name="address"
                      className="p-input"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter full street address"
                    />
                  </div>
                  <div className="p-input-group">
                    <label className="p-label">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      className="p-input"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+64..."
                    />
                  </div>
                  <div className="p-input-group">
                    <label className="p-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="p-input"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="store@affurnishing.co.nz"
                    />
                  </div>
                  <div className="p-input-group full">
                    <label className="p-label">Description</label>
                    <textarea
                      name="description"
                      className="p-input"
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Brief details about this location..."
                    />
                  </div>
                  <div className="p-input-group full">
                    <label className="p-label">Google Maps Embed URL</label>
                    <input
                      type="url"
                      name="google_map_url"
                      className="p-input"
                      value={form.google_map_url}
                      onChange={handleChange}
                      placeholder="https://www.google.com/maps/embed?..."
                    />
                  </div>
                  <div className="p-input-group">
                    <label className="p-label">Latitude</label>
                    <input
                      type="text"
                      name="latitude"
                      className="p-input"
                      value={form.latitude}
                      onChange={handleChange}
                      placeholder="-36.8485"
                    />
                  </div>
                  <div className="p-input-group">
                    <label className="p-label">Longitude</label>
                    <input
                      type="text"
                      name="longitude"
                      className="p-input"
                      value={form.longitude}
                      onChange={handleChange}
                      placeholder="174.7633"
                    />
                  </div>
                  <div className="p-input-group">
                    <label className="p-label">Sort Order</label>
                    <input
                      type="number"
                      name="sort_order"
                      className="p-input"
                      value={form.sort_order}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                  <div className="p-input-group" style={{ justifyContent: 'flex-end' }}>
                    <label className="p-checkbox-label">
                      <input
                        type="checkbox"
                        name="active"
                        checked={form.active === 1}
                        onChange={handleChange}
                      />
                      Active (visible on storefront)
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-modal-footer">
                <button type="button" className="p-btn p-btn-outline" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="p-btn p-btn-primary">
                  {editing ? 'Update Location' : 'Create Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="page-loading">Loading store locations...</div>
      ) : locations.length === 0 ? (
        <div className="empty-state">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.5 }}
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p>No store locations yet</p>
          <span>Click '+ Add Location' above to list your physical storefronts.</span>
        </div>
      ) : (
        <div className="p-table-wrap">
          <table className="p-data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Order</th>
                <th>Location Name</th>
                <th>City</th>
                <th>Phone</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc) => (
                <tr key={loc.id}>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    #{loc.sort_order ?? 0}
                  </td>
                  <td>
                    <strong>{loc.name}</strong>
                  </td>
                  <td>{loc.city || '-'}</td>
                  <td>{loc.phone || '-'}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                      }}
                    >
                      <span className={`p-status-dot ${loc.active ? 'active' : 'inactive'}`} />
                      {loc.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="p-action-btn" onClick={() => handleEdit(loc)}>
                      Edit
                    </button>
                    <button className="p-action-btn delete" onClick={() => handleDelete(loc.id)}>
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

export default StoreLocations