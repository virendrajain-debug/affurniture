import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { API_BASE } from './config'
import Header from './components/Header'
import Hero from './components/Hero'
import Deals from './components/Deals'
import Category from './components/Category'
import ProductGrid from './components/ProductGrid'
import PromoPoster from './components/PromoPoster'
import Stores from './components/Stores'
import AboutSection from './components/AboutSection'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import ContactPage from './pages/ContactPage'
import TermsPage from './pages/TermsPage'
import AboutPage from './pages/AboutPage'
import WinzPage from './pages/WinzPage'
import WinzQuote from './pages/WinzQuote'
import ProductDetail from './pages/ProductDetail'
import PrivacyPage from './pages/PrivacyPage'
import DeliveryInfoPage from './pages/DeliveryInfoPage'
import ShopFurniturePage from './pages/ShopFurniturePage'
import ReturnsPage from './pages/ReturnsPage'
import ApplyForFinance from './pages/ApplyForFinance'
import CategoryPage from './pages/CategoryPage'
import OnSalePage from './pages/OnSalePage'
import StoreLocationPage from './pages/StoreLocationPage'
import SearchPage from './pages/SearchPage'
import DynamicPage from './pages/DynamicPage'
import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AdBanner({ ad }) {
  if (!ad?.image) return null
  return (
    <a href={ad.link || '#'} target="_blank" rel="noopener noreferrer" className="home-ad-banner">
      <img src={ad.image} alt={ad.name} loading="lazy" />
    </a>
  )
}

function DynamicCategories() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data)
      })
      .catch(() => {})
  }, [])

  return (
    <>
      {categories.filter(cat => !['Office', 'Outdoor'].includes(cat.name)).map((cat, idx) => (
        <div key={cat.id}>
          <Category
            id={`cat-${cat.id}`}
            title={cat.name}
            apiCategory={cat.name}
            image={cat.image || undefined}
            link={`/category/${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
            reverse={idx % 2 !== 0}
          />
          <ProductGrid
            sectionId={`products-${cat.id}`}
            label={`${cat.name.toUpperCase()} COLLECTION`}
            title={`${cat.name} for your home.`}
            category={cat.name}
            compact={idx > 1}
          />
        </div>
      ))}
    </>
  )
}

function HomePage() {
  const [homeAds, setHomeAds] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/api/ad-campaigns/active?position=homepage`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setHomeAds(data) })
      .catch(() => {})
  }, [])

  const getAd = (index) => homeAds[index] || null

  return (
    <>
      <Header />
      <main id="home">
        <Hero />
        <Deals />
        <DynamicCategories />
        {getAd(0) && <AdBanner ad={getAd(0)} />}
        <PromoPoster ad={getAd(1)} />
        {getAd(1) && <AdBanner ad={getAd(1)} />}
        <Stores />
        {getAd(2) && <AdBanner ad={getAd(2)} />}
        <AboutSection />
        <Testimonials />
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/on-sale" element={<OnSalePage />} />
        <Route path="/store-locations" element={<StoreLocationPage />} />
        <Route path="/apply-for-finance" element={<ApplyForFinance />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/winz" element={<WinzPage />} />
        <Route path="/winz-quote" element={<WinzQuote />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy-policy" element={<PrivacyPage />} />
        <Route path="/delivery-info" element={<DeliveryInfoPage />} />
        <Route path="/shop-furniture" element={<ShopFurniturePage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/page/:slug" element={<DynamicPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
