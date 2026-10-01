import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import { getJson } from './api'
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

const ContactPage = lazy(() => import('./pages/ContactPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const WinzPage = lazy(() => import('./pages/WinzPage'))
const WinzQuote = lazy(() => import('./pages/WinzQuote'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const DeliveryInfoPage = lazy(() => import('./pages/DeliveryInfoPage'))
const ReturnsPage = lazy(() => import('./pages/ReturnsPage'))
const ApplyForFinance = lazy(() => import('./pages/ApplyForFinance'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const OnSalePage = lazy(() => import('./pages/OnSalePage'))
const StoreLocationPage = lazy(() => import('./pages/StoreLocationPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const DynamicPage = lazy(() => import('./pages/DynamicPage'))
import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function DynamicCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getJson('/api/categories')
      .then(data => {
        if (Array.isArray(data)) setCategories(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null

  return (
    <>
      {categories.filter(cat => !['Office', 'Outdoor'].includes(cat.name)).map((cat, idx) => (
        <div key={cat.id}>
          <Category
            title={cat.name}
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
  const [promoBanners, setPromoBanners] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getJson('/api/homepage')
      .then(data => {
        if (data && typeof data === 'object') {
          setPromoBanners({
            banner1: data.promo_banner_1 || null,
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <>
      <Header />
      <main id="home">
        <Hero />
        <Deals />
        <DynamicCategories />
        {promoBanners.banner1 && <PromoPoster ad={promoBanners.banner1} />}
        <Stores />
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
      <Suspense fallback={<div style={{display:'grid',placeItems:'center',height:'100vh',font:'500 16px "DM Sans"',color:'#72695d'}}>Loading...</div>}>
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
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/page/:slug" element={<DynamicPage />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
