import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const cursor = document.createElement('div')
cursor.className = 'custom-cursor'
document.body.appendChild(cursor)

const cursorDot = document.createElement('div')
cursorDot.className = 'custom-cursor-dot'
document.body.appendChild(cursorDot)

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px'
  cursor.style.top = e.clientY + 'px'
  cursorDot.style.left = e.clientX + 'px'
  cursorDot.style.top = e.clientY + 'px'
})

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

function observeFadeIns() {
  document.querySelectorAll('.fade-in:not(.visible), .fade-in-left:not(.visible), .fade-in-right:not(.visible), .scale-in:not(.visible)').forEach(el => {
    observer.observe(el)
  })
}

observeFadeIns()

const mutationObserver = new MutationObserver(() => {
  observeFadeIns()
})
mutationObserver.observe(document.body, { childList: true, subtree: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
