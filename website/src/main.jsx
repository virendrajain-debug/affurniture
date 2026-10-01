import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

document.body.classList.add('js-loaded')

const cursor = document.createElement('div')
cursor.className = 'custom-cursor'
document.body.appendChild(cursor)

const cursorDot = document.createElement('div')
cursorDot.className = 'custom-cursor-dot'
document.body.appendChild(cursorDot)

// Coalesce pointer updates to one paint per frame and move with transform
// (GPU-composited) instead of left/top, which forces layout on every event.
let pointerX = 0
let pointerY = 0
let cursorFrame = null

function paintCursor() {
  cursorFrame = null
  const position = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`
  cursor.style.transform = position
  cursorDot.style.transform = position
}

document.addEventListener('mousemove', (e) => {
  pointerX = e.clientX
  pointerY = e.clientY
  if (cursorFrame === null) cursorFrame = requestAnimationFrame(paintCursor)
}, { passive: true })

document.addEventListener('mouseover', (e) => {
  if (e.target.closest('a, button, input, textarea, select, .product-card, .primary, label')) {
    cursor.classList.add('hovering')
    cursorDot.classList.add('hovering')
  }
})

document.addEventListener('mouseout', (e) => {
  if (e.target.closest('a, button, input, textarea, select, .product-card, .primary, label')) {
    cursor.classList.remove('hovering')
    cursorDot.classList.remove('hovering')
  }
})

document.addEventListener('mousedown', () => cursor.classList.add('clicked'))
document.addEventListener('mouseup', () => cursor.classList.remove('clicked'))

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
      observer.unobserve(entry.target)
    }
  })
}, observerOptions)

const REVEAL_SELECTOR = '.fade-in:not(.visible), .fade-in-left:not(.visible), .fade-in-right:not(.visible), .scale-in:not(.visible)'

function observeFadeIns(root) {
  const scope = root instanceof Element ? root : document
  if (scope.matches && scope.matches(REVEAL_SELECTOR)) observer.observe(scope)
  scope.querySelectorAll(REVEAL_SELECTOR).forEach(el => {
    observer.observe(el)
  })
}

observeFadeIns(document)

// Only scan nodes that were actually added instead of re-querying the whole
// document on every DOM mutation.
const mutationObserver = new MutationObserver((records) => {
  records.forEach((record) => {
    record.addedNodes.forEach((node) => {
      if (node.nodeType === 1) observeFadeIns(node)
    })
  })
})
mutationObserver.observe(document.body, { childList: true, subtree: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
