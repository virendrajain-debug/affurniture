// ============================================================
// Premium Store Locations Management Module
// ============================================================
// Features: Store location CRUD, Google map embed config, 
// active/inactive indicators, fully integrated with global themes.
// API: GET /api/store-locations/all, POST, PUT /:id, DELETE /:id
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

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
    image: '',
    sort_order: 0,
    active: 1,
  })
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const authToken = getAuthToken(token)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchLocations = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/store-locations/all`, {
        headers: { Authorization: `Bearer ${authToken}` },
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
    fetchLocations()
  }, [token])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm({
      ...form,
      [name]: type === 'checkbox' ? (e.target.checked ? 1 : 0) : value,
    })
  }

  const handleImageUpload = async (file) => {
    if (!file) return
    setUploadingImage(true)
    const formData = new FormData()
    formData.append('image', file)
    formData.append('file', file)
    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        const url = data.url || data.imageUrl || data.image_url || data.secure_url
        if (url) {
          setForm((prev) => ({ ...prev, image: url }))
          showToast('Image uploaded successfully', 'success')
        }
      } else {
        showToast('Failed to upload image', 'error')
      }
    } catch {
      showToast('Error uploading image', 'error')
    } finally {
      setUploadingImage(false)
    }
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
      image: '',
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
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showToast(editing ? 'Location updated' : 'Location created', 'success')
        resetForm()
        fetchLocations()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Operation failed', 'error')
      }
    } catch {
      showToast('Server error', 'error')
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
      image: loc.image || '',
      sort_order: loc.sort_order ?? 0,
      active: loc.active ? 1 : 0,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this showroom location?')) return
    try {
      const res = await fetch(`${API_BASE}/api/store-locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (res.ok) {
        showToast('Location deleted', 'success')
        fetchLocations()
      } else {
        showToast('Delete failed', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    }
  }

  return (
    <div className="admin-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="admin-header">
        <h2 className="admin-title">Store Locations & Showrooms</h2>
        <button
          className="btn-primary"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          + Add Location
        </button>
      </div>

      {/* Add / Edit Location Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Showroom Location' : 'Add New Showroom Location'}</h3>
              <button className="modal-close-btn" onClick={resetForm}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="admin-grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Location Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Auckland Central"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="e.g. Auckland"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Full Street Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="e.g. 123 Queen Street"
                  />
                </div>

                <div className="admin-grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-input"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+64 9 123 4567"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="store@affurniture.co.nz"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Google Maps Embed URL</label>
                  <input
                    type="url"
                    name="google_map_url"
                    className="form-input"
                    value={form.google_map_url}
                    onChange={handleChange}
                    placeholder="https://www.google.com/maps/embed?..."
                  />
                </div>

                {form.google_map_url && (
                  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <iframe
                      src={form.google_map_url}
                      width="100%"
                      height="250"
                      style={{ border: 0, display: 'block' }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Google Maps Preview"
                    />
                  </div>
                )}

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Store Image</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    {form.image && (
                      <div style={{ width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                        <img
                          src={getAssetUrl(form.image)}
                          alt="Store Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = '/placeholder.png' }}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="text"
                        name="image"
                        className="form-input"
                        value={form.image}
                        onChange={handleChange}
                        placeholder="Or enter image URL"
                      />
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          background: 'var(--hover-bg)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageUpload(e.target.files[0])
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    value={form.description}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Opening hours, parking info, etc."
                  />
                </div>

                <div className="admin-grid-2" style={{ alignItems: 'center' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Sort Order</label>
                    <input
                      type="number"
                      name="sort_order"
                      className="form-input"
                      value={form.sort_order}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '16px' }}>
                    <input
                      type="checkbox"
                      id="locActive"
                      name="active"
                      checked={form.active === 1}
                      onChange={handleChange}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="locActive" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Active on storefront
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editing ? 'Update Location' : 'Create Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="table-container contain-content">
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading store locations...
          </div>
        ) : locations.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>No store locations yet</p>
            <span style={{ fontSize: '0.85rem' }}>Click &lsquo;+ Add Location&rsquo; above to list physical showrooms.</span>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Order</th>
                <th style={{ width: '60px' }}>Image</th>
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
                    {loc.image ? (
                      <img
                        src={getAssetUrl(loc.image)}
                        alt={loc.name}
                        style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                        onError={(e) => { e.target.src = '/placeholder.png' }}
                      />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                        No img
                      </div>
                    )}
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{loc.name}</strong>
                  </td>
                  <td>{loc.city || '-'}</td>
                  <td>{loc.phone || '-'}</td>
                  <td>
                    <span className={`badge ${loc.active ? 'badge-success' : 'badge-danger'}`}>
                      {loc.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(loc)}
                        title="Edit Location"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(loc.id)}
                        title="Delete Location"
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
    </div>
  )
}

export default StoreLocations