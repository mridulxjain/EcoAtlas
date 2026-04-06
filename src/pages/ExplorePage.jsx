import { useMemo, useState } from 'react'
import SectionHeading from '../components/SectionHeading'

function Sparkline({ values, tone = 'default' }) {
  if (!values?.length) return null

  const width = 84
  const height = 22
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = Math.max(1, max - min)

  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`sparkline ${tone === 'down' ? 'down' : ''}`} aria-hidden="true">
      <polyline points={points} />
    </svg>
  )
}

function trendTone(points) {
  if (!points?.length) return 'default'
  const first = points[0]
  const last = points.at(-1)
  if (last < first) return 'down'
  if (last > first) return 'up'
  return 'flat'
}

function ExplorePage({ regions, species, statusColor }) {
  const [filterRegion, setFilterRegion] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [filterRisk, setFilterRisk] = useState('All')
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(species[0]?.id ?? null)

  const filteredSpecies = useMemo(
    () =>
      species.filter((item) => {
        const byRegion = filterRegion === 'All' || item.region === filterRegion
        const byType = filterType === 'All' || item.type === filterType
        const byRisk = filterRisk === 'All' || item.risk === filterRisk
        return byRegion && byType && byRisk
      }),
    [species, filterRegion, filterType, filterRisk],
  )

  const types = ['All', ...new Set(species.map((item) => item.type))]

  const selectedSpecies = useMemo(() => {
    return filteredSpecies.find((item) => item.id === selectedSpeciesId) ?? filteredSpecies[0] ?? null
  }, [filteredSpecies, selectedSpeciesId])

  const selectedMetrics = useMemo(() => {
    if (!selectedSpecies) return null

    const first = selectedSpecies.trend[0]
    const last = selectedSpecies.trend.at(-1)
    const absoluteDelta = last - first
    const deltaPct = Math.round((absoluteDelta / first) * 100)
    const yearlyRate = Math.round(absoluteDelta / Math.max(1, selectedSpecies.trend.length - 1))

    const riskScoreMap = {
      Critical: 92,
      High: 78,
      Moderate: 56,
      Low: 34,
    }

    const riskScore = riskScoreMap[selectedSpecies.risk] ?? 50
    const resilience = Math.max(8, 100 - riskScore)

    return {
      first,
      last,
      absoluteDelta,
      deltaPct,
      yearlyRate,
      riskScore,
      resilience,
      trend: selectedSpecies.trend,
      trendTone: trendTone(selectedSpecies.trend),
    }
  }, [selectedSpecies])

  return (
    <section className="page-panel">
      <SectionHeading
        title="Species Explorer"
        subtitle="Only Northern Himalaya species with filters by region, category, and risk"
      />

      <div className="filters glass">
        <label>
          Region
          <select value={filterRegion} onChange={(event) => setFilterRegion(event.target.value)}>
            <option>All</option>
            {regions.map((region) => (
              <option key={region.id}>{region.name}</option>
            ))}
          </select>
        </label>

        <label>
          Category
          <select value={filterType} onChange={(event) => setFilterType(event.target.value)}>
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>

        <label>
          Risk Level
          <select value={filterRisk} onChange={(event) => setFilterRisk(event.target.value)}>
            <option>All</option>
            <option>Critical</option>
            <option>High</option>
            <option>Moderate</option>
          </select>
        </label>
      </div>

      <div className="explore-toolbar">
        <p>
          Showing {filteredSpecies.length} profile{filteredSpecies.length === 1 ? '' : 's'}
        </p>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => {
            setFilterRegion('All')
            setFilterType('All')
            setFilterRisk('All')
            setSelectedSpeciesId(species[0]?.id ?? null)
          }}
        >
          Reset Filters
        </button>
      </div>

      <div className="explorer-layout">
        <aside className="species-menu glass">
          <h3>Species Menu</h3>
          <p>Select a species to open full details.</p>
          <div className="species-menu-list">
            {filteredSpecies.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`species-menu-item ${selectedSpecies?.id === item.id ? 'active' : ''}`}
                onClick={() => setSelectedSpeciesId(item.id)}
              >
                <strong>{item.name}</strong>
                <small>
                  {item.region} · {item.type}
                </small>
              </button>
            ))}
          </div>
        </aside>

        <section className="species-inspector glass" aria-live="polite">
          {!selectedSpecies || !selectedMetrics ? (
            <p>No species available for current filters.</p>
          ) : (
            <>
              <div className="inspector-top">
                <div className="inspector-image">
                  <img src={selectedSpecies.image} alt={selectedSpecies.name} loading="lazy" />
                </div>
                <div className="inspector-head">
                  <h3>{selectedSpecies.name}</h3>
                  <p className="detail-subline">{selectedSpecies.scientificName}</p>
                  <div className="inspector-tags">
                    <span
                      className="status-pill"
                      style={{ backgroundColor: statusColor[selectedSpecies.status] || '#9cc0a7' }}
                    >
                      {selectedSpecies.status}
                    </span>
                    <div className="focus-meta">
                      <span>{selectedSpecies.region}</span>
                      <span>{selectedSpecies.type}</span>
                      <span>{selectedSpecies.group}</span>
                      <span>Risk: {selectedSpecies.risk}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="inspector-metrics-grid">
                <article>
                  <small>Starting Population</small>
                  <strong>{selectedMetrics.first}</strong>
                  <div className="metric-spark">
                    <Sparkline values={selectedMetrics.trend} tone={selectedMetrics.trendTone} />
                  </div>
                </article>
                <article>
                  <small>Latest Population</small>
                  <strong>{selectedMetrics.last}</strong>
                  <div className="metric-spark">
                    <Sparkline values={selectedMetrics.trend} tone={selectedMetrics.trendTone} />
                  </div>
                </article>
                <article className={selectedMetrics.absoluteDelta < 0 ? 'decline-card' : ''}>
                  <small>Net Change</small>
                  <strong>{selectedMetrics.absoluteDelta}</strong>
                  <div className="metric-spark">
                    <Sparkline values={selectedMetrics.trend} tone={selectedMetrics.trendTone} />
                  </div>
                </article>
                <article className={selectedMetrics.deltaPct < 0 ? 'decline-card' : ''}>
                  <small>Change %</small>
                  <strong>{selectedMetrics.deltaPct}%</strong>
                  <div className="metric-spark">
                    <Sparkline values={selectedMetrics.trend} tone={selectedMetrics.trendTone} />
                  </div>
                </article>
                <article className={selectedMetrics.yearlyRate < 0 ? 'decline-card' : ''}>
                  <small>Annual Change</small>
                  <strong>{selectedMetrics.yearlyRate}</strong>
                  <div className="metric-spark">
                    <Sparkline values={selectedMetrics.trend} tone={selectedMetrics.trendTone} />
                  </div>
                </article>
                <article>
                  <small>Risk Index</small>
                  <strong>{selectedMetrics.riskScore}/100</strong>
                  <div className="metric-spark">
                    <Sparkline values={[0, selectedMetrics.riskScore]} tone="down" />
                  </div>
                </article>
                <article>
                  <small>Resilience Index</small>
                  <strong>{selectedMetrics.resilience}/100</strong>
                  <div className="metric-spark">
                    <Sparkline values={[0, selectedMetrics.resilience]} tone="up" />
                  </div>
                </article>
              </div>

              <div className="sparkline-legend" aria-hidden="true">
                <span><i className="tone-up" /> Increasing trend</span>
                <span><i className="tone-down" /> Declining trend</span>
                <span><i className="tone-flat" /> Stable trend</span>
              </div>

              <div className="inspector-info-grid">
                <article>
                  <h4>Habitat</h4>
                  <p>{selectedSpecies.habitat}</p>
                </article>
                <article>
                  <h4>Threats</h4>
                  <p>{selectedSpecies.threats}</p>
                </article>
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  )
}

export default ExplorePage
