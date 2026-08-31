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
    console.error('ErrorBoundary caught a runtime rendering error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
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
          background: '#fffdf9',
          color: '#28241f',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '520px',
            background: '#fff',
            border: '1px solid #e8e2d8',
            borderRadius: '16px',
            padding: '40px 30px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#fbf4ea',
              color: '#aa7a3e',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '28px'
            }}>
              &#9888;
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 10px', color: '#28241f' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#6a655e', lineHeight: 1.5, margin: '0 0 24px' }}>
              We encountered an unexpected error while rendering this page. You can refresh or return to the homepage.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '10px 22px',
                  background: '#28241f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '10px 22px',
                  background: '#f8f5ee',
                  color: '#28241f',
                  border: '1px solid #dcd5c9',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Return to Home
              </button>
            </div>

            {this.state.error && (
              <details style={{ marginTop: '24px', textAlign: 'left', background: '#f8f5ee', padding: '12px', borderRadius: '8px', fontSize: '0.78rem', color: '#888' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#555' }}>Technical Details</summary>
                <pre style={{ margin: '8px 0 0', overflowX: 'auto', whiteSpace: 'pre-wrap', color: '#c0392b' }}>
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
