// ============================================================
// Premium Returns & Refunds Module (Theme Engine Enabled)
// ============================================================
// Features: Markdown rich text editor toolbar, content saving,
// fully integrated with global themes.
// API: GET /api/returns, PUT /api/returns
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../config'

function Returns({ token }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const textareaRef = useRef(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const fetchReturns = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/returns`)
        if (res.ok) {
          const data = await res.json()
          setContent(typeof data === 'string' ? data : data.content || '')
        }
      } catch {
        showToast('Failed to load returns policy', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchReturns()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/returns`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        showToast('Returns page saved successfully', 'success')
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || 'Failed to save', 'error')
      }
    } catch {
      showToast('Server error while saving', 'error')
    } finally {
      setSaving(false)
    }
  }

  const applyFormat = (prefix, suffix) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = content.substring(start, end)
    const before = content.substring(0, start)
    const after = content.substring(end)
    setContent(before + prefix + (selected || 'text') + suffix + after)
  }

  const handleToolbarClick = (type) => {
    switch (type) {
      case 'bold':
        applyFormat('**', '**')
        break
      case 'italic':
        applyFormat('_', '_')
        break
      case 'underline':
        applyFormat('<u>', '</u>')
        break
      case 'h1':
        applyFormat('\n# ', '\n')
        break
      case 'h2':
        applyFormat('\n## ', '\n')
        break
      case 'bullet':
        applyFormat('\n- ', '\n')
        break
      case 'numbered':
        applyFormat('\n1. ', '\n')
        break
      default:
        break
    }
  }

  return (
    <div className="premium-module">
      <style>{`
        .premium-module { animation: fadeIn 0.4s ease-out; width: 100%; padding: 24px; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .p-form-card { background: var(--sidebar-bg); border-radius: 12px; border: 1px solid var(--border-color); padding: 30px; width: 100%; box-sizing: border-box; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }

        .p-editor-toolbar { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: var(--header-bg); border: 1px solid var(--border-color); border-bottom: none; border-top-left-radius: 8px; border-top-right-radius: 8px; flex-wrap: wrap; }
        .p-toolbar-btn { background: transparent; border: 1px solid transparent; color: var(--text-secondary); width: 34px; height: 34px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; }
        .p-toolbar-btn:hover { background: var(--hover-bg); color: var(--text-primary); border-color: var(--border-color); }
        .p-toolbar-divider { width: 1px; height: 20px; background: var(--border-color); margin: 0 4px; }

        .p-editor-textarea {
          width: 100%; padding: 16px; border: 1px solid var(--border-color); border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;
          font-size: 0.95rem; color: var(--text-primary); background: var(--header-bg); outline: none; box-sizing: border-box;
          font-family: inherit; line-height: 1.6; resize: vertical; transition: border-color 0.2s;
        }
        .p-editor-textarea:focus { border-color: var(--accent-color); }

        .p-form-actions { display: flex; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-color); }
        .p-btn { padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; border: none; transition: all 0.2s; }
        .p-btn-primary { background: var(--accent-color); color: #fff; }
        .p-btn-primary:hover:not(:disabled) { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .p-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

        .toast-premium {
          position: fixed; top: 24px; right: 24px; z-index: 9999;
          background: var(--sidebar-bg); border-left: 4px solid var(--accent-color);
          color: var(--text-primary); padding: 16px 24px; border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-weight: 500; font-size: 0.95rem;
          display: flex; align-items: center; gap: 12px; animation: slideInRight 0.3s ease-out;
        }
        .toast-premium.error { border-left-color: #ef4444; }
        .toast-premium.success { border-left-color: #22c55e; }
      `}</style>

      {toast && <div className={`toast-premium ${toast.type}`}>{toast.msg}</div>}

      <div className="p-form-card">
        <div className="p-editor-toolbar">
          <button type="button" className="p-toolbar-btn" title="Bold" onClick={() => handleToolbarClick('bold')}>
            <strong>B</strong>
          </button>
          <button type="button" className="p-toolbar-btn" title="Italic" onClick={() => handleToolbarClick('italic')}>
            <em>I</em>
          </button>
          <button type="button" className="p-toolbar-btn" title="Underline" onClick={() => handleToolbarClick('underline')}>
            <u>U</u>
          </button>
          <span className="p-toolbar-divider" />
          <button type="button" className="p-toolbar-btn" title="Heading 1" onClick={() => handleToolbarClick('h1')}>
            H1
          </button>
          <button type="button" className="p-toolbar-btn" title="Heading 2" onClick={() => handleToolbarClick('h2')}>
            H2
          </button>
          <span className="p-toolbar-divider" />
          <button type="button" className="p-toolbar-btn" title="Bullet List" onClick={() => handleToolbarClick('bullet')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
          <button type="button" className="p-toolbar-btn" title="Numbered List" onClick={() => handleToolbarClick('numbered')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
              <path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
            </svg>
          </button>
        </div>

        <textarea
          ref={textareaRef}
          className="p-editor-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="16"
          disabled={loading}
          placeholder="Enter returns policy content here..."
        />

        <div className="p-form-actions">
          <button
            type="button"
            className="p-btn p-btn-primary"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Returns