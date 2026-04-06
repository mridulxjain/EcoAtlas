import { Link } from 'react-router-dom'

function HomePage({ liveData, loading }) {
  const forestCover = loading ? '...' : liveData.indicators?.forestAreaPct?.value?.toFixed(2) ?? 'N/A'
  const forestYear = liveData.indicators?.forestAreaPct?.year ?? null

  return (
    <section className="hero home-minimal page-panel">
      <p className="kicker">ECOATLAS LIVE CONSERVATION SIGNAL</p>
      <h1>
        EcoAtlas
        <span>northern himalaya biodiversity observatory</span>
      </h1>
      <p className="hero-copy">
        A focused intelligence layer for fragile mountain ecosystems. Start with the most essential indicator and drill
        into map, tracker, and species insights.
      </p>

      <section className="forest-cover-spotlight glass" aria-live="polite">
        <p className="spotlight-label">India Forest Cover</p>
        <h2>
          {forestCover}
          <span>%</span>
        </h2>
        <p className="spotlight-caption">
          World Bank indicator: forest area as percentage of total land area
          {forestYear ? ` (latest available year: ${forestYear})` : ''}
        </p>
      </section>

      <div className="cta-row">
        <Link className="cta-btn" to="/map">
          Open Conservation Map
        </Link>
        <Link className="cta-btn ghost" to="/tracker">
          Open Live Tracker
        </Link>
      </div>
    </section>
  )
}

export default HomePage
