// ============================================================
// Premium Audit Logs & System Activity Module
// ============================================================
// Features: Comprehensive historical activity stream, live keyword search,
// action type filtering, entity filtering, formatted timestamps, colored action badges,
// IP address tracking, quick refresh, and log clearing.
// API: GET /api/audit-logs, DELETE /api/audit-logs/clear
// ============================================================

import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

function AuditLogs({ token }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [entityFilter, setEntityFilter] = useState('all')
  const [toast, setToast] = useState(null)
  const [clearing, setClearing] = useState(false)

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

  const fetchAuditLogs = async () => {
    setLoading(true)
    const activeToken = getActiveToken()
    try {
      let url = `${API_BASE}/api/audit-logs?limit=200`
      if (actionFilter !== 'all') url += `&action=${actionFilter}`
      if (entityFilter !== 'all') url += `&entity=${encodeURIComponent(entityFilter)}`
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        setLogs(Array.isArray(data) ? data : [])
      } else {
        showToast('Failed to fetch audit logs', 'error')
      }
    } catch {
      showToast('Server connection failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [token, actionFilter, entityFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchAuditLogs()
  }

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to permanently clear all audit history? This action cannot be undone.')) return
    setClearing(true)
    const activeToken = getActiveToken()
    try {
      const res = await fetch(`${API_BASE}/api/audit-logs/clear`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      if (res.ok) {
        showToast('Audit logs cleared successfully', 'success')
        setLogs([])
      } else {
        showToast('Failed to clear audit logs', 'error')
      }
    } catch {
      showToast('Server error while clearing logs', 'error')
    } finally {
      setClearing(false)
    }
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return dateStr
    }
  }

  const getActionBadgeClass = (action) => {
    switch (action?.toUpperCase()) {
      case 'CREATE':
        return 'badge badge-success'
      case 'UPDATE':
        return 'badge badge-info'
      case 'DELETE':
        return 'badge badge-danger'
      case 'STATUS_CHANGE':
        return 'badge badge-warning'
      default:
        return 'badge badge-default'
    }
  }

  const uniqueEntities = Array.from(new Set(logs.map((l) => l.entity).filter(Boolean)))

  return (
    <div className="admin-page">
      {/* Toast Alert */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Main Header & Controls */}
      <div className="admin-card">
        <div className="admin-header" style={{ marginBottom: '16px' }}>
          <h2 className="admin-title">Audit Logs & Activity Stream</h2>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={fetchAuditLogs} disabled={loading} title="Refresh Log Entries">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button className="btn-action btn-delete" onClick={handleClearLogs} disabled={clearing || logs.length === 0} title="Clear Log History">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Clear Logs
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <form className="filter-toolbar" onSubmit={handleSearchSubmit} style={{ margin: 0 }}>
          <input
            type="text"
            className="search-box"
            placeholder="Search keyword, email, change..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="filter-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
          </select>

          <select
            className="filter-select"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="all">All Modules / Entities</option>
            <option value="Product">Product</option>
            <option value="Category">Category</option>
            <option value="Subcategory">Subcategory</option>
            <option value="Banner">Banner</option>
            <option value="Ad Campaign">Ad Campaign</option>
            <option value="Enquiry">Enquiry</option>
            <option value="WinZ Quote">WinZ Quote</option>
            <option value="Finance Application">Finance Application</option>
            {uniqueEntities.map(
              (ent) =>
                !['Product', 'Category', 'Subcategory', 'Banner', 'Ad Campaign', 'Enquiry', 'WinZ Quote', 'Finance Application'].includes(ent) && (
                  <option key={ent} value={ent}>
                    {ent}
                  </option>
                )
            )}
          </select>

          <button type="submit" className="btn-primary">
            Filter
          </button>
        </form>
      </div>

      {/* Logs Table */}
      <div className="table-container contain-content">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '180px' }}>Timestamp</th>
              <th style={{ width: '180px' }}>Admin User</th>
              <th style={{ width: '130px' }}>Action</th>
              <th style={{ width: '140px' }}>Entity</th>
              <th>Details / Description</th>
              <th style={{ width: '110px', textAlign: 'right' }}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Loading audit trail entries...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No audit records found. Any changes you make will appear here automatically.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {formatDateTime(log.created_at)}
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {log.admin_email || 'admin@gmail.com'}
                    </strong>
                  </td>
                  <td>
                    <span className={getActionBadgeClass(log.action)}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'var(--header-bg)', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-color)' }}>
                      {log.entity || 'System'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                    {log.details || '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {log.ip_address || '127.0.0.1'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AuditLogs
