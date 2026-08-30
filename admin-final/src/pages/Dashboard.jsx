// ============================================================
// Premium Dashboard Layout Component (Lazy Loaded & Theme Enabled)
// ============================================================
// Uses React.lazy & Suspense to code-split dashboard modules 
// and eliminate heavy bundle warnings.
// ============================================================

import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

import PageSkeletonLoader from '../components/PageSkeletonLoader'

// Lazy Route Imports for Code Splitting
const Overview = lazy(() => import('./Overview'))
const Categories = lazy(() => import('./Categories'))
const Subcategories = lazy(() => import('./Subcategories'))
const AddProduct = lazy(() => import('./AddProduct'))
const ProductList = lazy(() => import('./ProductList'))
const AdCampaign = lazy(() => import('./AdCampaign'))
const PageEditor = lazy(() => import('./PageEditor'))
const Banners = lazy(() => import('./Banners'))
const CustomerEnquiries = lazy(() => import('./CustomerEnquiries'))
const ContactEnquiries = lazy(() => import('./ContactEnquiries'))
const Terms = lazy(() => import('./Terms'))
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy'))
const Contact = lazy(() => import('./Contact'))
const Profile = lazy(() => import('./Profile'))
const WinzQuotes = lazy(() => import('./WinzQuotes'))
const FinanceApplications = lazy(() => import('./FinanceApplications'))
const DeliveryInfo = lazy(() => import('./DeliveryInfo'))
const ShopFurniture = lazy(() => import('./ShopFurniture'))
const Returns = lazy(() => import('./Returns'))
const StoreLocations = lazy(() => import('./StoreLocations'))
const Settings = lazy(() => import('./Settings'))
const DynamicPages = lazy(() => import('./DynamicPages'))
const Testimonials = lazy(() => import('./Testimonials'))

function Dashboard({ onLogout, token }) {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1025)
  
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('adminProfileImage') || null
  })

  const [userName, setUserName] = useState(() => {
    try {
      const activeToken = getAuthToken(token)
      if (activeToken) {
        const payload = JSON.parse(atob(activeToken.split('.')[1]))
        return payload.name || payload.email?.split('@')[0] || 'Admin'
      }
    } catch {}
    return 'Admin'
  })

  const [userEmail, setUserEmail] = useState(() => {
    try {
      const activeToken = getAuthToken(token)
      if (activeToken) {
        const payload = JSON.parse(atob(activeToken.split('.')[1]))
        return payload.email || 'admin@gmail.com'
      }
    } catch {}
    return 'admin@gmail.com'
  })

  const handleProfileImageChange = (img) => {
    setProfileImage(img)
    if (img) localStorage.setItem('adminProfileImage', img)
  }

  // Fetch profile from API on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const activeToken = getAuthToken(token)
      if (!activeToken) return
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.profile_image) {
            setProfileImage(data.profile_image)
            localStorage.setItem('adminProfileImage', data.profile_image)
          }
          if (data.name) setUserName(data.name)
          if (data.email) setUserEmail(data.email)
        }
      } catch {}
    }
    fetchProfile()
  }, [token])

  return (
    <div className="dashboard-wrapper">
      <style>{`
        .dashboard-wrapper {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background-color: var(--page-bg, #1a1e29);
          transition: background-color 0.4s ease;
          overflow-x: hidden;
          position: relative;
        }
        
        .dashboard-main {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          min-width: 0;
          width: 100%;
          margin-left: 0;
          box-sizing: border-box;
          transition: margin-left 260ms cubic-bezier(0.16, 1, 0.3, 1), width 260ms cubic-bezier(0.16, 1, 0.3, 1);
          will-change: margin-left, width;
        }

        @media (min-width: 1025px) {
          .dashboard-main.shifted {
            margin-left: 280px;
            width: calc(100% - 280px);
          }
        }

        .dashboard-content {
          flex: 1;
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
        }

        .dashboard-suspense-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 60vh;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .dashboard-content { padding: 0; }
        }
      `}</style>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        profileImage={profileImage} 
        userName={userName}
        userEmail={userEmail}
        onLogout={onLogout} 
      />
      
      <div className={`dashboard-main ${sidebarOpen ? 'shifted' : ''}`}>
        <Header 
          onLogout={onLogout} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          profileImage={profileImage} 
          token={token} 
        />
        <div className="dashboard-content">
          <Suspense fallback={<PageSkeletonLoader />}>
            <Routes>
              <Route index element={<Overview token={token} />} />
              
              {/* 1. Collections & Catalog */}
              <Route path="categories" element={<Categories token={token} />} />
              <Route path="subcategories" element={<Navigate to="/dashboard/categories" replace />} />
              <Route path="add-product" element={<Navigate to="/dashboard/products" replace />} />
              <Route path="products" element={<ProductList token={token} />} />
              
              {/* 2. Promotion & Testimonial */}
              <Route path="ad-campaign" element={<AdCampaign token={token} />} />
              <Route path="testimonials" element={<Testimonials token={token} />} />
              
              {/* 3. Requests & Applications */}
              <Route path="winz-quotes" element={<WinzQuotes token={token} />} />
              <Route path="finance-applications" element={<FinanceApplications token={token} />} />
              
              {/* 4. Inquiries */}
              <Route path="customer-enquiries" element={<CustomerEnquiries token={token} />} />
              <Route path="contact-enquiries" element={<ContactEnquiries token={token} />} />
              <Route path="active-enquiry" element={<Navigate to="/dashboard/customer-enquiries" replace />} />
              <Route path="past-enquiry" element={<Navigate to="/dashboard/customer-enquiries" replace />} />
              
              {/* 5. Pages & Media (Individual sub-routes for all 8 storefront pages) */}
              <Route path="pages" element={<PageEditor token={token} />} />
              <Route path="pages/:pageKey" element={<PageEditor token={token} />} />
              <Route path="page-banners" element={<PageEditor token={token} />} />
              <Route path="banners" element={<Navigate to="/dashboard/pages/home" replace />} />
              <Route path="slider" element={<Navigate to="/dashboard/pages/home" replace />} />
              <Route path="about" element={<Navigate to="/dashboard/pages/about" replace />} />
              <Route path="dynamic-pages" element={<DynamicPages token={token} />} />

              {/* 6. Direct Aliases for Pages & Media */}
              <Route path="terms" element={<PageEditor token={token} />} />
              <Route path="privacy-policy" element={<PageEditor token={token} />} />
              <Route path="delivery-info" element={<PageEditor token={token} />} />
              <Route path="returns" element={<PageEditor token={token} />} />
              <Route path="shop-furniture" element={<PageEditor token={token} />} />
              <Route path="contact" element={<PageEditor token={token} />} />

              {/* 7. Store Locations (Unified inside Pages & Media) */}
              <Route path="store-locations" element={<Navigate to="/dashboard/pages/store-locations" replace />} />
              <Route path="showrooms" element={<Navigate to="/dashboard/pages/store-locations" replace />} />
              <Route path="winz-finance" element={<Navigate to="/dashboard/pages/winz-finance" replace />} />
              
              {/* Profile & Settings */}
              <Route path="profile" element={<Profile profileImage={profileImage} onProfileImageChange={handleProfileImageChange} token={token} />} />
              <Route path="settings" element={<Settings token={token} />} />
              <Route path="audit-logs" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
