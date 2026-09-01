// ============================================================
// Premium Dashboard Layout Component (Lazy Loaded & Theme Enabled)
// ============================================================
// Uses React.lazy & Suspense to code-split dashboard modules 
// and eliminate heavy bundle warnings.
// ============================================================

import { useState, useEffect, Suspense } from 'react'
import { lazyRetry } from '../utils/lazyRetry'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { API_BASE } from '../config'
import { getAuthToken } from '../utils/api'

import PageSkeletonLoader from '../components/PageSkeletonLoader'

// Lazy Route Imports for Code Splitting
const Overview = lazyRetry(() => import('./Overview'))
const Categories = lazyRetry(() => import('./Categories'))
const Subcategories = lazyRetry(() => import('./Subcategories'))
const AddProduct = lazyRetry(() => import('./AddProduct'))
const ProductList = lazyRetry(() => import('./ProductList'))
const WinzInventory = lazyRetry(() => import('./WinzInventory'))
const AdCampaign = lazyRetry(() => import('./AdCampaign'))
const PageEditor = lazyRetry(() => import('./PageEditor'))
const HomeManager = lazyRetry(() => import('./HomeManager'))
const Banners = lazyRetry(() => import('./Banners'))
const CustomerEnquiries = lazyRetry(() => import('./CustomerEnquiries'))
const ContactEnquiries = lazyRetry(() => import('./ContactEnquiries'))
const Terms = lazyRetry(() => import('./Terms'))
const PrivacyPolicy = lazyRetry(() => import('./PrivacyPolicy'))
const Contact = lazyRetry(() => import('./Contact'))
const Profile = lazyRetry(() => import('./Profile'))
const WinzQuotes = lazyRetry(() => import('./WinzQuotes'))
const FinanceApplications = lazyRetry(() => import('./FinanceApplications'))
const DeliveryInfo = lazyRetry(() => import('./DeliveryInfo'))
const ShopFurniture = lazyRetry(() => import('./ShopFurniture'))
const Returns = lazyRetry(() => import('./Returns'))
const StoreLocations = lazyRetry(() => import('./StoreLocations'))
const Settings = lazyRetry(() => import('./Settings'))
const DynamicPages = lazyRetry(() => import('./DynamicPages'))
const Testimonials = lazyRetry(() => import('./Testimonials'))

function Dashboard({ onLogout, token }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 991 : true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleToggleSidebar = () => {
    setIsTransitioning(true)
    setSidebarOpen((prev) => !prev)
  }

  const handleCloseSidebar = () => {
    if (sidebarOpen) {
      setIsTransitioning(true)
      setSidebarOpen(false)
    }
  }

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
      }, 520)
      return () => clearTimeout(timer)
    }
  }, [isTransitioning, sidebarOpen])
  
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
      if (!activeToken || activeToken === 'undefined' || activeToken === 'null' || !activeToken.includes('.')) return
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
          width: ${sidebarOpen ? 'calc(100% - 260px)' : '100%'};
          margin-left: ${sidebarOpen ? '260px' : '0'};
          box-sizing: border-box;
          transform: translateZ(0);
          position: relative;
          min-height: 100vh;
          transition: margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dashboard-content-wrapper {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          width: 100%;
          min-width: 0;
        }

        .dashboard-content {
          flex: 1;
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
        }

        .dashboard-transition-overlay {
          display: none !important;
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

        @media (max-width: 991px) {
          .dashboard-main {
            margin-left: 0;
            width: 100%;
          }
          .dashboard-content { padding: 0; }
        }
      `}</style>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={handleCloseSidebar} 
        profileImage={profileImage} 
        userName={userName}
        userEmail={userEmail}
        onLogout={onLogout} 
      />
      
      <div className="dashboard-main">
        <Header 
          onLogout={onLogout} 
          onMenuToggle={handleToggleSidebar} 
          profileImage={profileImage} 
          token={token} 
        />
        <div className="dashboard-content-wrapper">
          <div className="dashboard-content">
          <Suspense fallback={<PageSkeletonLoader />}>
            <Routes>
              <Route index element={<Overview token={token} />} />
              
              {/* 1. Collections & Catalog */}
              <Route path="categories" element={<Categories token={token} />} />
              <Route path="subcategories" element={<Navigate to="/dashboard/categories" replace />} />
              <Route path="add-product" element={<Navigate to="/dashboard/products" replace />} />
              <Route path="products" element={<ProductList token={token} />} />
            <Route path="winz-inventory" element={<WinzInventory token={token} />} />
              
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
              
              {/* 5. Pages & Media (Storefront CMS pages) */}
              <Route path="pages" element={<PageEditor token={token} />} />
              <Route path="pages/:pageKey" element={<PageEditor token={token} />} />
              <Route path="page-banners" element={<PageEditor token={token} />} />
              <Route path="banners" element={<Banners token={token} />} />
              <Route path="home-manager" element={<HomeManager token={token} />} />
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

              {/* 7. Store Locations & Showrooms */}
              <Route path="store-locations" element={<StoreLocations token={token} />} />
              <Route path="showrooms" element={<Navigate to="/dashboard/store-locations" replace />} />
              <Route path="winz-finance" element={<Navigate to="/dashboard/pages/winz" replace />} />
              <Route path="winz" element={<Navigate to="/dashboard/pages/winz" replace />} />
              <Route path="finance" element={<Navigate to="/dashboard/pages/finance" replace />} />
              
              {/* Profile & Settings */}
              <Route path="profile" element={<Profile profileImage={profileImage} onProfileImageChange={handleProfileImageChange} token={token} />} />
              <Route path="settings" element={<Settings token={token} />} />
              <Route path="audit-logs" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default Dashboard
