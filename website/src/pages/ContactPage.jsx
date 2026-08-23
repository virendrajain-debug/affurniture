import Header from '../components/Header'
import ContactSection from '../components/ContactSection'
import Footer from '../components/Footer'

function ContactPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '120px' }}>
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}

export default ContactPage
