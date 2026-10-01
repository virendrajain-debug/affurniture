// ============================================================
// Premium Testimonials & Customer Reviews Studio
// ============================================================
// Features:
//  - Full testimonials grid & interactive data table
//  - Embedded "+ Add Testimonial" & "Edit Testimonial" Modal Studio
//  - Interactive 1-5 Gold Star Rating Selector
//  - Avatar file upload / URL uploader with initial avatar fallback
//  - Quick active/inactive status switch with instant persistence
//  - Compact SVG micro-action buttons (No text clutter)
//  - API: GET, POST, PUT, DELETE /api/testimonials, PUT /api/testimonials/:id/toggle
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { API_BASE, getAssetUrl } from '../config'
import { getAuthToken } from '../utils/api'

function Testimonials({ token }) {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'inactive'
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState(null)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(true)
  const [activeId, setActiveId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [form, setForm] = useState({
    client_name: '',
    role_or_city: 'Auckland',
    review_text: '',
    rating: 5,
    avatar_url: '',
    is_active: 1,
    sort_order: 0,
  })

  const avatarInputRef = useRef(null)

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

  // Fetch Testimonials
  const fetchTestimonials = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/testimonials`)
      if (res.ok) {
        const data = await res.json()
        setTestimonials(Array.isArray(data) ? data : [])
      }
    } catch {
      showToast('Error loading testimonials', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsCreating(true)
    setActiveId(null)
    setForm({
      client_name: '',
      role_or_city: 'Auckland',
      review_text: '',
      rating: 5,
      avatar_url: '',
      is_active: 1,
      sort_order: testimonials.length + 1,
    })
    setModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (t) => {
    setIsCreating(false)
    setActiveId(t.id)
    setForm({
      client_name: t.client_name || '',
      role_or_city: t.role_or_city || 'Auckland',
      review_text: t.review_text || '',
      rating: Number(t.rating) || 5,
      avatar_url: t.avatar || '',
      is_active: t.is_active === 1 || t.is_active === true ? 1 : 0,
      sort_order: t.sort_order || 0,
    })
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  // Avatar Upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    const authToken = getActiveToken()
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(`${API_BASE}/api/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        const url = data.imageUrl || data.url || ''
        setForm((prev) => ({ ...prev, avatar_url: url }))
        showToast('Avatar uploaded successfully', 'success')
      } else {
        showToast('Avatar upload failed', 'error')
      }
    } catch {
      showToast('Server error uploading avatar', 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Submit Save / Create
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.client_name.trim()) return showToast('Client name is required', 'warning')
    if (!form.review_text.trim()) return showToast('Review quote is required', 'warning')

    setSaving(true)
    const authToken = getActiveToken()
    const url = isCreating ? `${API_BASE}/api/testimonials` : `${API_BASE}/api/testimonials/${activeId}`
    const method = isCreating ? 'POST' : 'PUT'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        showToast(`Testimonial ${isCreating ? 'created' : 'updated'} successfully!`, 'success')
        handleCloseModal()
        fetchTestimonials()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to save testimonial', 'error')
      }
    } catch {
      showToast('Server error saving testimonial', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Toggle Status
  const handleToggleStatus = async (id) => {
    const authToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/testimonials/${id}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        setTestimonials((prev) =>
          prev.map((t) => (t.id === id ? { ...t, is_active: data.is_active } : t))
        )
        showToast('Status updated', 'success')
      } else {
        showToast('Failed to toggle status', 'error')
      }
    } catch {
      showToast('Server error toggling status', 'error')
    }
  }

  // Delete Testimonial
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete the testimonial from "${name}"?`)) return

    const authToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (res.ok) {
        showToast('Testimonial deleted', 'success')
        setTestimonials((prev) => prev.filter((t) => t.id !== id))
      } else {
        showToast('Failed to delete testimonial', 'error')
      }
    } catch {
      showToast('Server error deleting testimonial', 'error')
    }
  }

  // Filter Testimonials
  const filtered = testimonials.filter((t) => {
    const matchSearch =
      t.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.role_or_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.review_text?.toLowerCase().includes(searchTerm.toLowerCase())

    let matchStatus = true
    if (statusFilter === 'active') matchStatus = t.is_active === 1
    if (statusFilter === 'inactive') matchStatus = t.is_active === 0

    return matchSearch && matchStatus
  })

  return (
    <div className="admin-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Top Action Header */}
      <div className="admin-header">
        <h2 className="admin-title">Customer Testimonials &amp; Reviews</h2>

        <button className="btn-primary" onClick={handleOpenCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Testimonial
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-toolbar" style={{ background: 'var(--sidebar-bg)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
        <input
          type="text"
          className="search-box"
          placeholder="Search by client name, location, or quote text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '220px' }}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'active', 'inactive'].map((st) => (
            <button
              key={st}
              type="button"
              className={statusFilter === st ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.8rem', textTransform: 'capitalize' }}
              onClick={() => setStatusFilter(st)}
            >
              {st} ({st === 'all' ? testimonials.length : testimonials.filter((x) => (st === 'active' ? x.is_active === 1 : x.is_active === 0)).length})
            </button>
          ))}
        </div>
      </div>

      {/* Testimonials Grid / List */}
      {loading ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          Loading customer testimonials...
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No testimonials found</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem' }}>
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search filters.' : 'Add your first customer review to showcase on the storefront.'}
          </p>
          <button className="btn-primary" onClick={handleOpenCreate}>
            Add Testimonial
          </button>
        </div>
      ) : (
        <div className="admin-grid-3" style={{ gap: '18px' }}>
          {filtered.map((t) => {
            const initial = t.client_name ? t.client_name.charAt(0).toUpperCase() : 'C'
            const stars = Array.from({ length: 5 }, (_, i) => i < (Number(t.rating) || 5))

            return (
              <div
                key={t.id}
                className="admin-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  margin: 0,
                  position: 'relative',
                  borderTop: `3px solid ${t.is_active ? 'var(--accent-color)' : 'var(--border-color)'}`,
                }}
              >
                {/* Top Card Section: Rating & Status Toggle */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    {/* 5-Star Visual Display */}
                    <div style={{ display: 'flex', gap: '2px', color: '#f59e0b', fontSize: '1.05rem', letterSpacing: '1px' }}>
                      {stars.map((filled, i) => (
                        <span key={i} style={{ color: filled ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}>★</span>
                      ))}
                    </div>

                    {/* Active Status Badge / Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(t.id)}
                      className={`badge ${t.is_active ? 'badge-success' : 'badge-default'}`}
                      style={{ cursor: 'pointer', border: 'none', padding: '4px 10px', fontSize: '0.72rem' }}
                      title="Click to toggle active status"
                    >
                      {t.is_active ? '✓ Active' : '○ Inactive'}
                    </button>
                  </div>

                  {/* Review Text */}
                  <blockquote style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    &ldquo;{t.review_text}&rdquo;
                  </blockquote>
                </div>

                {/* Bottom Card Section: Author Info & Micro-Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--border-color)', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Avatar */}
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, var(--accent-color), #4a6fa5)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        flexShrink: 0,
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {t.avatar_url ? (
                        <img src={getAssetUrl(t.avatar_url)} alt={t.client_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none' }} />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>

                    <div>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>
                        {t.client_name}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {t.role_or_city || 'Verified Customer'}
                      </span>
                    </div>
                  </div>

                  {/* Micro-Action Buttons */}
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn-icon btn-edit"
                      onClick={() => handleOpenEdit(t)}
                      title="Edit Testimonial"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(t.id, t.client_name)}
                      title="Delete Testimonial"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD / EDIT TESTIMONIAL MODAL                                 */}
      {/* ============================================================ */}
      {modalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-container"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                {isCreating ? 'Add Customer Testimonial' : `Edit Review: ${form.client_name}`}
              </h3>
              <button type="button" className="modal-close-btn" onClick={handleCloseModal} title="Close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* 1. Client Name & Location */}
                <div className="admin-grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Client / Customer Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.client_name}
                      onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                      placeholder="e.g. Mele T. or Sarah Jenkins"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">City / Customer Role</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.role_or_city}
                      onChange={(e) => setForm({ ...form, role_or_city: e.target.value })}
                      placeholder="e.g. Auckland or Verified Buyer"
                    />
                  </div>
                </div>

                {/* 2. Interactive Star Rating Selector */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Rating (Stars)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px', fontSize: '1.5rem', cursor: 'pointer' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          style={{
                            color: star <= form.rating ? '#f59e0b' : 'rgba(255,255,255,0.2)',
                            transition: 'transform 0.15s ease',
                          }}
                          onClick={() => setForm({ ...form, rating: star })}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                          title={`${star} Star${star > 1 ? 's' : ''}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                      {form.rating} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* 3. Review Quote Text */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Review Quote *</label>
                  <textarea
                    className="form-textarea"
                    rows="4"
                    value={form.review_text}
                    onChange={(e) => setForm({ ...form, review_text: e.target.value })}
                    placeholder="Enter customer feedback quote here..."
                    required
                  />
                </div>

                {/* 4. Avatar Upload / URL */}
                <div style={{ background: 'var(--header-bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                    Client Avatar Photo (Optional)
                  </label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, var(--accent-color), #4a6fa5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        flexShrink: 0,
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {form.avatar_url ? (
                        <img src={getAssetUrl(form.avatar_url)} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none' }} />
                      ) : (
                        <span>{form.client_name ? form.client_name.charAt(0).toUpperCase() : 'C'}</span>
                      )}
                    </div>

                    <input
                      type="text"
                      className="form-input"
                      placeholder="Image URL or upload a photo"
                      value={form.avatar_url}
                      onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                      style={{ flex: 1, fontSize: '0.85rem' }}
                    />

                    <label className="btn-secondary" style={{ cursor: uploadingAvatar ? 'not-allowed' : 'pointer', padding: '8px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                      {uploadingAvatar ? 'Uploading...' : 'Upload File'}
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #888)' }}>Recommended: 400 x 400 pixels</span>
                  </div>
                </div>

                {/* 5. Active Toggle & Sort Order */}
                <div className="admin-grid-2" style={{ alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="is_active_check"
                      checked={form.is_active === 1}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
                    />
                    <label htmlFor="is_active_check" style={{ fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Display on Public Storefront (Active)
                    </label>
                  </div>

                  <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                    <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Sort Order:</label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.sort_order}
                      onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                      style={{ width: '80px', padding: '6px 10px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : isCreating ? 'Publish Testimonial' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Testimonials
