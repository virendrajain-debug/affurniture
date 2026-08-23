// ============================================================
// Dashboard Layout Component
// ============================================================
// Main dashboard layout with sidebar navigation and content area.
// Uses React Router for nested route rendering.
//
// STATE:
//   - sidebarOpen: Toggle mobile sidebar visibility
//   - profileImage: Admin profile photo (stored in localStorage)
// ============================================================

import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Overview from './Overview'
import Categories from './Categories'
import Subcategories from './Subcategories'
import AddProduct from './AddProduct'
import ProductList from './ProductList'
import AdCampaign from './AdCampaign'
import Slider from './Slider'
import ActiveEnquiry from './ActiveEnquiry'
import PastEnquiry from './PastEnquiry'
import Terms from './Terms'
import About from './About'
import PrivacyPolicy from './PrivacyPolicy'
import Contact from './Contact'
import DiscountList from './DiscountList'
import Profile from './Profile'
import SocialLinks from './SocialLinks'
import WinzQuotes from './WinzQuotes'
import Showrooms from './Showrooms'
import DeliveryInfo from './DeliveryInfo'
import ShopFurniture from './ShopFurniture'
import Returns from './Returns'
import Banners from './Banners'

function Dashboard({ onLogout, token }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Load profile image from localStorage on mount
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('adminProfileImage') || null
  })

  // Update profile image and persist to localStorage
  const handleProfileImageChange = (img) => {
    setProfileImage(img)
    if (img) {
      localStorage.setItem('adminProfileImage', img)
    } else {
      localStorage.removeItem('adminProfileImage')
    }
  }

  return (
    <div className="dashboard">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} profileImage={profileImage} onLogout={onLogout} />
      <div className="dashboard-main">
        <Header onLogout={onLogout} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} profileImage={profileImage} token={token} />
        <div className="dashboard-content">
          <Routes>
            <Route index element={<Overview token={token} />} />
            
            {/* Project Management */}
            <Route path="categories" element={<Categories token={token} />} />
            <Route path="subcategories" element={<Subcategories token={token} />} />
            <Route path="add-product" element={<AddProduct token={token} />} />
            <Route path="products" element={<ProductList token={token} />} />
            
            {/* Ads Management */}
            <Route path="ad-campaign" element={<AdCampaign token={token} />} />
            <Route path="slider" element={<Slider token={token} />} />
            
            {/* Enquiry Management */}
            <Route path="active-enquiry" element={<ActiveEnquiry token={token} />} />
            <Route path="past-enquiry" element={<PastEnquiry token={token} />} />
            <Route path="winz-quotes" element={<WinzQuotes token={token} />} />
            
            {/* Pages and Media */}
            <Route path="terms" element={<Terms token={token} />} />
            <Route path="about" element={<About token={token} />} />
            <Route path="privacy-policy" element={<PrivacyPolicy token={token} />} />
            <Route path="contact" element={<Contact token={token} />} />
            <Route path="social-links" element={<SocialLinks token={token} />} />
            <Route path="showrooms" element={<Showrooms token={token} />} />
            <Route path="delivery-info" element={<DeliveryInfo token={token} />} />
            <Route path="shop-furniture" element={<ShopFurniture token={token} />} />
            <Route path="returns" element={<Returns token={token} />} />
            
            {/* Banners */}
            <Route path="banners" element={<Banners token={token} />} />
            
            {/* Discount & Promo */}
            <Route path="discount-list" element={<DiscountList token={token} />} />
            
            {/* Settings */}
            <Route path="profile" element={<Profile profileImage={profileImage} onProfileImageChange={handleProfileImageChange} token={token} />} />
            
            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default Dashboard