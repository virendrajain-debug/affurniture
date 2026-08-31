import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin ErrorBoundary caught a rendering error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoDashboard = () => {
    window.location.href = '#/dashboard'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: 'var(--bg-primary, #0f1422)',
          color: 'var(--text-primary, #fff)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '520px',
            background: 'var(--card-bg, #1a2238)',
            border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            borderRadius: '16px',
            padding: '40px 30px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(212, 175, 55, 0.15)',
              color: '#d4af37',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '28px'
            }}>
              &#9888;
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-primary, #fff)' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary, rgba(255,255,255,0.7))', lineHeight: 1.5, margin: '0 0 24px' }}>
              The admin workspace encountered an unexpected rendering issue. You can refresh or return to the overview.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '10px 22px',
                  background: '#d4af37',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Reload Workspace
              </button>
              <button
                onClick={this.handleGoDashboard}
                style={{
                  padding: '10px 22px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
            </div>

            {this.state.error && (
              <details style={{ marginTop: '24px', textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#d4af37' }}>Error Stack</summary>
                <pre style={{ margin: '8px 0 0', overflowX: 'auto', whiteSpace: 'pre-wrap', color: '#ff6b6b' }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary;
