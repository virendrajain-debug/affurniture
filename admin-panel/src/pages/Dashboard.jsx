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

// Lazy Route Imports for Code Splitting
const Overview = lazy(() => import('./Overview'))
const Categories = lazy(() => import('./Categories'))
const Subcategories = lazy(() => import('./Subcategories'))
const AddProduct = lazy(() => import('./AddProduct'))
const ProductList = lazy(() => import('./ProductList'))
const AdCampaign = lazy(() => import('./AdCampaign'))
const Slider = lazy(() => import('./Slider'))
const ActiveEnquiry = lazy(() => import('./ActiveEnquiry'))
const PastEnquiry = lazy(() => import('./PastEnquiry'))
const Terms = lazy(() => import('./Terms'))
const About = lazy(() => import('./About'))
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy'))
const Contact = lazy(() => import('./Contact'))
const DiscountList = lazy(() => import('./DiscountList'))
const Profile = lazy(() => import('./Profile'))
const SocialLinks = lazy(() => import('./SocialLinks'))
const WinzQuotes = lazy(() => import('./WinzQuotes'))
const Showrooms = lazy(() => import('./Showrooms'))
const DeliveryInfo = lazy(() => import('./DeliveryInfo'))
const ShopFurniture = lazy(() => import('./ShopFurniture'))
const Returns = lazy(() => import('./Returns'))
const Banners = lazy(() => import('./Banners'))
const FinanceApplications = lazy(() => import('./FinanceApplications'))
const StoreLocations = lazy(() => import('./StoreLocations'))
const Settings = lazy(() => import('./Settings'))
const DynamicPages = lazy(() => import('./DynamicPages'))
const Testimonials = lazy(() => import('./Testimonials'))

function Dashboard({ onLogout, token }) {
  // Sidebar is open by default on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1025)
  
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('adminProfileImage') || null
  })

  const [userName, setUserName] = useState(() => {
    try {
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload.name || payload.email?.split('@')[0] || 'Admin'
      }
    } catch {}
    return 'Admin'
  })

  const handleProfileImageChange = (img) => {
    setProfileImage(img)
    if (img) localStorage.setItem('adminProfileImage', img)
    else localStorage.removeItem('adminProfileImage')
  }

  // Fetch profile from API on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.name) setUserName(data.name)
          if (data.profile_image) {
            setProfileImage(data.profile_image)
            localStorage.setItem('adminProfileImage', data.profile_image)
          }
        }
      } catch {}
    }
    if (token) fetchProfile()
  }, [token])

  return (
    <div className="dashboard-wrapper">
      <style>{`
        .dashboard-wrapper {
          display: flex;
          min-height: 100vh;
          background-color: var(--page-bg, #1a1e29);
          transition: background-color 0.4s ease;
        }
        
        .dashboard-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          transition: margin-left 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          margin-left: 0;
        }

        @media (min-width: 1025px) {
          .dashboard-main.shifted {
            margin-left: 280px;
          }
          .premium-header {
            padding-left: 32px !important;
          }
        }

        .dashboard-content {
          padding: 32px;
          flex: 1;
          overflow-y: auto;
        }

        .dashboard-suspense-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 60vh;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 1rem;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .dashboard-content { padding: 16px; }
        }
      `}</style>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        profileImage={profileImage} 
        userName={userName}
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
          <Suspense fallback={
            <div className="dashboard-suspense-loader">
              <div style={{ width: '20px', height: '20px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Loading module...
            </div>
          }>
            <Routes>
              <Route index element={<Overview token={token} />} />
              
              {/* Product Management */}
              <Route path="categories" element={<Categories token={token} />} />
              <Route path="subcategories" element={<Subcategories token={token} />} />
              <Route path="add-product" element={<AddProduct token={token} />} />
              <Route path="products" element={<ProductList token={token} />} />
              
              {/* Advertisement Management */}
              <Route path="ad-campaign" element={<AdCampaign token={token} />} />
              <Route path="slider" element={<Slider token={token} />} />
              <Route path="banners" element={<Banners token={token} />} />
              
              {/* Customer Requests & Enquiries */}
              <Route path="active-enquiry" element={<ActiveEnquiry token={token} />} />
              <Route path="past-enquiry" element={<PastEnquiry token={token} />} />
              <Route path="winz-quotes" element={<WinzQuotes token={token} />} />
              <Route path="finance-applications" element={<FinanceApplications token={token} />} />
              <Route path="testimonials" element={<Testimonials token={token} />} />
              
              {/* Pages & Store Setup */}
              <Route path="about" element={<About token={token} />} />
              <Route path="terms" element={<Terms token={token} />} />
              <Route path="privacy-policy" element={<PrivacyPolicy token={token} />} />
              <Route path="contact" element={<Contact token={token} />} />
              <Route path="social-links" element={<SocialLinks token={token} />} />
              <Route path="showrooms" element={<Showrooms token={token} />} />
              <Route path="delivery-info" element={<DeliveryInfo token={token} />} />
              <Route path="shop-furniture" element={<ShopFurniture token={token} />} />
              <Route path="returns" element={<Returns token={token} />} />
              <Route path="store-locations" element={<StoreLocations token={token} />} />
              <Route path="settings" element={<Settings token={token} />} />
              <Route path="dynamic-pages" element={<DynamicPages token={token} />} />
              
              {/* Discounts & Profile */}
              <Route path="discount-list" element={<DiscountList token={token} />} />
              <Route path="profile" element={<Profile profileImage={profileImage} onProfileImageChange={handleProfileImageChange} token={token} />} />
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default Dashboard