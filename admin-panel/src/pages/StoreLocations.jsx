import { useState, useEffect } from 'react'
import { API_BASE } from '../config'

function StoreLocations({ token }) {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '', email: '', google_map_url: '', latitude: '', longitude: '', description: '', sort_order: 0, active: 1 })
  const [showForm, setShowForm] = useState(false)

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/store-locations/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setLocations(Array.isArray(data) ? data : [])
    } catch { setLocations([]) }
    setLoading(false)
  }

  useEffect(() => { fetchLocations() }, [])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? (e.target.checked ? 1 : 0) : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) { alert('Location name is required'); return }
    try {
      const url = editing ? `${API_BASE}/api/store-locations/${editing.id}` : `${API_BASE}/api/store-locations`
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        fetchLocations()
        resetForm()
      } else {
        const data = await res.json()
        alert(data.message || 'Failed to save')
      }
    } catch { alert('Network error') }
  }

  const handleEdit = (loc) => {
    setEditing(loc)
    setForm({
      name: loc.name || '', address: loc.address || '', city: loc.city || '',
      phone: loc.phone || '', email: loc.email || '', google_map_url: loc.google_map_url || '',
      latitude: loc.latitude || '', longitude: loc.longitude || '',
      description: loc.description || '', sort_order: loc.sort_order || 0, active: loc.active
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this store location?')) return
    try {
      await fetch(`${API_BASE}/api/store-locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchLocations()
    } catch { alert('Failed to delete') }
  }

  const resetForm = () => {
    setForm({ name: '', address: '', city: '', phone: '', email: '', google_map_url: '', latitude: '', longitude: '', description: '', sort_order: 0, active: 1 })
    setEditing(null)
    setShowForm(false)
  }

  if (loading) return <div className="page-loading">Loading...</div>

  return (
    <div className="store-locations-page">
      <div className="page-header">
        <h1>Store Locations</h1>
        <button className="add-btn" onClick={() => { resetForm(); setShowForm(true) }}>+ Add Location</button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <div className="form-modal-header">
              <h2>{editing ? 'Edit Location' : 'Add New Location'}</h2>
              <button className="close-btn" onClick={resetForm}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group">
                  <label>Location Name *</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>City</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} />
                </div>
                <div className="input-group full-width">
                  <label>Address</label>
                  <input type="text" name="address" value={form.address} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Phone</label>
                  <input type="text" name="phone" value={form.phone} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} />
                </div>
                <div className="input-group full-width">
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
                </div>
                <div className="input-group full-width">
                  <label>Google Maps Embed URL</label>
                  <input type="url" name="google_map_url" value={form.google_map_url} onChange={handleChange} placeholder="https://www.google.com/maps/embed?..." />
                </div>
                <div className="input-group">
                  <label>Latitude</label>
                  <input type="text" name="latitude" value={form.latitude} onChange={handleChange} placeholder="-36.85" />
                </div>
                <div className="input-group">
                  <label>Longitude</label>
                  <input type="text" name="longitude" value={form.longitude} onChange={handleChange} placeholder="174.76" />
                </div>
                <div className="input-group">
                  <label>Sort Order</label>
                  <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="active" checked={form.active === 1} onChange={handleChange} />
                    Active (visible on website)
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>
                <button type="submit" className="save-btn">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="locations-list">
        {locations.length === 0 ? (
          <div className="empty-state">No store locations yet. Add your first location!</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>City</th>
                <th>Phone</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map(loc => (
                <tr key={loc.id}>
                  <td>{loc.sort_order}</td>
                  <td><strong>{loc.name}</strong></td>
                  <td>{loc.city || '-'}</td>
                  <td>{loc.phone || '-'}</td>
                  <td><span className={`status-dot ${loc.active ? 'active' : 'inactive'}`}></span></td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(loc)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(loc.id)}>Delete</button>
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
