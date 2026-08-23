import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../config'

function ShopFurniture({ token }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const textareaRef = useRef(null)

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch(`${API_BASE}/api/shop-furniture`)
      .then(r => r.json())
      .then(data => { if (data.content) setContent(data.content) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/shop-furniture`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        showToast('Shop Furniture page saved', 'success')
      } else {
        showToast('Failed to save', 'error')
      }
    } catch {
      showToast('Server error', 'error')
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
      case 'bold': applyFormat('**', '**'); break
      case 'italic': applyFormat('_', '_'); break
      case 'underline': applyFormat('<u>', '</u>'); break
      case 'h1': applyFormat('\n# ', '\n'); break
      case 'h2': applyFormat('\n## ', '\n'); break
      case 'bullet': applyFormat('\n- ', '\n'); break
      case 'numbered': applyFormat('\n1. ', '\n'); break
      default: break
    }
  }

  return (
    <div className="terms-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="section-header">
        <h2>Shop Furniture</h2>
        <p>Edit shop furniture page content and descriptions</p>
      </div>

      <div className="editor-container">
        <div className="editor-toolbar">
          <button className="toolbar-btn" title="Bold" onClick={() => handleToolbarClick('bold')}><strong>B</strong></button>
          <button className="toolbar-btn" title="Italic" onClick={() => handleToolbarClick('italic')}><em>I</em></button>
          <button className="toolbar-btn" title="Underline" onClick={() => handleToolbarClick('underline')}><u>U</u></button>
          <span className="toolbar-divider" />
          <button className="toolbar-btn" title="Heading" onClick={() => handleToolbarClick('h1')}>H1</button>
          <button className="toolbar-btn" title="Subheading" onClick={() => handleToolbarClick('h2')}>H2</button>
          <span className="toolbar-divider" />
          <button className="toolbar-btn" title="Bullet List" onClick={() => handleToolbarClick('bullet')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
          <button className="toolbar-btn" title="Numbered List" onClick={() => handleToolbarClick('numbered')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
              <path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
            </svg>
          </button>
        </div>

        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="20"
          disabled={loading}
          placeholder="Enter shop furniture content here..."
        />

        <div className="editor-actions">
          <button className="btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}

export default ShopFurniture
