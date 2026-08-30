function PromoPoster({ ad }) {
  return (
    <section className="promo-poster">
      <img src={ad?.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85'} alt={ad?.name || 'Modern furniture promotion'} />
      <div>
        <span>AF WEEKLY SPECIAL</span>
        <h2>{ad?.name || 'Bring comfort home.'}</h2>
        <p>{ad?.name ? 'Check out our latest deals and offers.' : 'Explore our latest living-room arrivals, all priced at $00.'}</p>
        <a className="primary" href={ad?.link || '#'} target="_blank" rel="noopener noreferrer">View</a>
      </div>
    </section>
  )
}

export default PromoPoster
