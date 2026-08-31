// ============================================================
// Executive Admin Panel Footer Component
// ============================================================
// Features: Dynamic copyright year, active site name sync, system status
// indicator, minimalist typography, and theme-adaptive glassmorphic design.
// ============================================================

import { useState, useEffect } from 'react'

function Footer() {
  const currentYear = new Date().getFullYear()
  const [siteName, setSiteName] = useState(() => localStorage.getItem('site_name') || 'AF Furnishings')

  useEffect(() => {
    const handleSettingsUpdate = () => {
      const stored = localStorage.getItem('site_name')
      if (stored) setSiteName(stored)
    }
    window.addEventListener('settings-updated', handleSettingsUpdate)
    window.addEventListener('storage', handleSettingsUpdate)
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate)
      window.removeEventListener('storage', handleSettingsUpdate)
    }
  }, [])

  return (
    <footer className="admin-footer">
      <style>{`
        .admin-footer {
          margin-top: auto;
          width: 100%;
          background: var(--header-bg, #1a1e29);
          border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          padding: 14px 32px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          color: var(--text-secondary, #94a3b8);
          font-size: 0.82rem;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background-color 0.4s ease, border-color 0.4s ease;
          position: relative;
          z-index: 10;
        }

        .admin-footer-left {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.7);
          animation: statusPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          display: inline-block;
          flex-shrink: 0;
        }

        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.85); }
        }

        .status-text {
          font-weight: 600;
          color: #10b981;
          letter-spacing: 0.2px;
        }

        .status-divider {
          opacity: 0.35;
          margin: 0 2px;
        }

        .status-version {
          color: var(--text-secondary, #94a3b8);
          font-weight: 500;
        }

        .admin-footer-right {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--text-secondary, #94a3b8);
        }

        .admin-footer-copyright {
          font-weight: 500;
          color: var(--text-primary, #f8fafc);
        }

        @media (max-width: 768px) {
          .admin-footer {
            flex-direction: column;
            text-align: center;
            padding: 12px 16px;
            gap: 8px;
          }
          .admin-footer-left,
          .admin-footer-right {
            justify-content: center;
          }
        }
      `}</style>

      {/* Left: System Status Indicator */}
      <div className="admin-footer-left">
        <span className="status-dot"></span>
        <span className="status-text">System Operational</span>
        <span className="status-divider">&bull;</span>
        <span className="status-version">CMS v2.4.0</span>
      </div>

      {/* Right: Minimalist Copyright Text */}
      <div className="admin-footer-right">
        <span>&copy; {currentYear}</span>
        <span className="admin-footer-copyright">{siteName}.</span>
        <span>All rights reserved.</span>
      </div>
    </footer>
  )
}

export default Footer;
