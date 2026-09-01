// ============================================================
// Clean Visual WYSIWYG Rich Text Editor Component (Optimized)
// ============================================================
// Features: Strictly visual editing, debounced input triggers (250ms)
// to eliminate UI re-render lag, React.memo tree isolation.
// ============================================================

import { useEffect, useRef, memo } from 'react'

const RichTextEditor = memo(function RichTextEditor({ 
  value, 
  onChange, 
  onFocus, 
  onBlur, 
  placeholder = 'Type your content here...', 
  minHeight = '280px', 
  isFocused = false 
}) {
  const editorRef = useRef(null)
  const debounceTimer = useRef(null)

  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        if (document.activeElement !== editorRef.current) {
          editorRef.current.innerHTML = value || ''
        }
      }
    }
  }, [value])

  const handleInput = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      if (editorRef.current && onChange) {
        onChange(editorRef.current.innerHTML)
      }
    }, 250)
  }

  const handleImmediateCommit = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML)
    }
  }

  return (
    <div
      className={`rte-container ${isFocused ? 'is-editor-focused' : ''}`}
      onClick={() => {
        if (onFocus) onFocus()
        if (editorRef.current && document.activeElement !== editorRef.current) {
          editorRef.current.focus()
        }
      }}
    >
      <div
        ref={editorRef}
        className="rte-editable"
        contentEditable
        onInput={handleInput}
        onFocus={onFocus}
        onBlur={(e) => {
          handleImmediateCommit()
          if (onBlur) onBlur(e)
        }}
        data-placeholder={placeholder}
        style={{ minHeight }}
      />
    </div>
  )
})

export default RichTextEditor;
