import { useMemo, useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import { SIMULATION_PRESETS } from '../data/himalayaData'
import {
  computeCollapseIndex,
  ecosystemStateFromIndex,
  projectSpeciesPopulation,
} from '../utils/biodiversity'

function SimulationPage({ species, liveData, loading }) {
  const [warming, setWarming] = useState(2)
  const [deforestation, setDeforestation] = useState(35)
  const [humanImpact, setHumanImpact] = useState(40)
  const [glacierLoss, setGlacierLoss] = useState(32)
  const [grazingPressure, setGrazingPressure] = useState(38)
  const [policyStrength, setPolicyStrength] = useState(45)
  const [projectionYear, setProjectionYear] = useState(2040)

  const avgRegionalTemp = useMemo(() => {
    if (!liveData?.climate?.length) return 0
    const sum = liveData.climate.reduce((total, item) => total + (item.temperature ?? 0), 0)
    return sum / liveData.climate.length
  }, [liveData])

  const climateSignal = Math.max(0, Math.round((avgRegionalTemp - 8) * 10) / 10)

  const yearFactor = useMemo(() => {
    const offset = Math.max(0, projectionYear - 2030)
    return 1 + offset * 0.015
  }, [projectionYear])

  const futureStressors = useMemo(
    () => ({
      warming: Number((warming * yearFactor).toFixed(2)),
      deforestation: Math.min(100, Math.round(deforestation * yearFactor)),
      humanImpact: Math.min(100, Math.round(humanImpact * yearFactor)),
      glacierLoss: Math.min(100, Math.round(glacierLoss * yearFactor)),
      grazingPressure: Math.min(100, Math.round(grazingPressure * yearFactor)),
      policyStrength: Math.max(0, Math.round(policyStrength / yearFactor)),
      climateSignal: Number((climateSignal * yearFactor).toFixed(2)),
    }),
    [warming, deforestation, humanImpact, glacierLoss, grazingPressure, policyStrength, climateSignal, yearFactor],
  )

  const collapseIndex = useMemo(
    () => computeCollapseIndex(futureStressors),
    [futureStressors],
  )

  const ecosystemState = ecosystemStateFromIndex(collapseIndex)

  const projection = useMemo(
    () => projectSpeciesPopulation(species, futureStressors),
    [species, futureStressors],
  )

  const topLoss = projection.slice().sort((a, b) => a.change - b.change).slice(0, 6)

  const scenarioMetrics = useMemo(() => {
    if (!projection.length) {
      return {
        currentTotal: 0,
        projectedTotal: 0,
        netDelta: 0,
        severeDropCount: 0,
        improvingCount: 0,
      }
    }

    const currentTotal = projection.reduce((sum, item) => sum + item.trend.at(-1), 0)
    const projectedTotal = projection.reduce((sum, item) => sum + item.projected, 0)
    const netDelta = Math.round(((projectedTotal - currentTotal) / Math.max(1, currentTotal)) * 100)
    const severeDropCount = projection.filter((item) => item.change <= -25).length
    const improvingCount = projection.filter((item) => item.change >= 0).length

    return {
      currentTotal,
      projectedTotal,
      netDelta,
      severeDropCount,
      improvingCount,
    }
  }, [projection])

  const maxLossBase = Math.max(1, ...topLoss.map((item) => item.trend.at(-1)))

  function applyPreset(values) {
    setWarming(values.warming)
    setDeforestation(values.deforestation)
    setHumanImpact(values.humanImpact)
    setGlacierLoss(values.glacierLoss)
    setGrazingPressure(values.grazingPressure)
    setPolicyStrength(values.policyStrength)
  }

  return (
    <section className="page-panel simulation-page">
      <SectionHeading
        title="Himalayas 2050"
        subtitle="Interactive future stress simulation enhanced with live climate context"
      />

      <div className="sim-top-controls">
        <div className="preset-row">
          {Object.entries(SIMULATION_PRESETS).map(([name, preset]) => (
            <button key={name} type="button" className="preset-chip" onClick={() => applyPreset(preset)}>
              {name}
            </button>
          ))}
        </div>

        <label className="year-control glass">
          Projection Year: <strong>{projectionYear}</strong>
          <input
            type="range"
            min="2030"
            max="2050"
            step="5"
            value={projectionYear}
            onChange={(e) => setProjectionYear(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="sim-live-band glass">
        <p>
          Live temperature signal: {loading ? 'loading...' : `${avgRegionalTemp.toFixed(1)}°C average`} across
          monitored regions
        </p>
        <p>Integrated climate stress factor: +{futureStressors.climateSignal.toFixed(1)}</p>
      </div>

      <div className="sim-summary-grid">
        <article className="glass sim-summary-card">
          <small>Scenario Net Shift</small>
          <strong className={scenarioMetrics.netDelta < 0 ? 'down' : 'up'}>{scenarioMetrics.netDelta}%</strong>
          <p>
            Total projected populations: {scenarioMetrics.projectedTotal.toLocaleString()} from{' '}
            {scenarioMetrics.currentTotal.toLocaleString()}
          </p>
        </article>
        <article className="glass sim-summary-card">
          <small>Severe Loss Risk</small>
          <strong>{scenarioMetrics.severeDropCount}</strong>
          <p>Species projected to drop by 25% or more</p>
        </article>
        <article className="glass sim-summary-card">
          <small>Stabilizing / Improving</small>
          <strong>{scenarioMetrics.improvingCount}</strong>
          <p>Species with flat or positive projected direction</p>
        </article>
      </div>

      <div className="simulation-layout">
        <div className="sim-controls glass">
          <label>
            Climate Rise: {warming.toFixed(1)}°C
            <input type="range" min="0" max="5" step="0.1" value={warming} onChange={(e) => setWarming(Number(e.target.value))} />
          </label>
          <label>
            Deforestation: {deforestation}%
            <input type="range" min="0" max="100" value={deforestation} onChange={(e) => setDeforestation(Number(e.target.value))} />
          </label>
          <label>
            Human Impact: {humanImpact}%
            <input type="range" min="0" max="100" value={humanImpact} onChange={(e) => setHumanImpact(Number(e.target.value))} />
          </label>
          <label>
            Glacier Loss: {glacierLoss}%
            <input type="range" min="0" max="100" value={glacierLoss} onChange={(e) => setGlacierLoss(Number(e.target.value))} />
          </label>
          <label>
            Grazing Pressure: {grazingPressure}%
            <input type="range" min="0" max="100" value={grazingPressure} onChange={(e) => setGrazingPressure(Number(e.target.value))} />
          </label>
          <label>
            Policy Strength (protection): {policyStrength}%
            <input type="range" min="0" max="100" value={policyStrength} onChange={(e) => setPolicyStrength(Number(e.target.value))} />
          </label>

          <div className="collapse-meter">
            <span>Ecosystem Status</span>
            <h3>{ecosystemState}</h3>
            <div className="meter-track">
              <div className="meter-fill" style={{ width: `${collapseIndex}%` }} />
            </div>
            <small>Collapse Index: {collapseIndex}/100</small>
          </div>

        </div>

        <div className="sim-impact glass">
          <div className="impact-headline">
            <h3>Most Vulnerable Species Projections</h3>
            <p>Comparison of latest known population vs scenario output</p>

            <div className="impact-legend" aria-hidden="true">
              <span>
                <i className="current" /> Current population
              </span>
              <span>
                <i className="projected" /> Projected population
              </span>
            </div>
          </div>
          {topLoss.map((item) => (
            <article key={item.id} className="impact-row">
              <div>
                <h4>{item.name}</h4>
                <small>
                  {item.region} - {item.type}
                </small>
                <div className="impact-bars">
                  <div className="impact-bar-track">
                    <span
                      className="impact-bar-fill current"
                      style={{ width: `${Math.round((item.trend.at(-1) / maxLossBase) * 100)}%` }}
                    />
                  </div>
                  <div className="impact-bar-track">
                    <span
                      className="impact-bar-fill projected"
                      style={{ width: `${Math.round((item.projected / maxLossBase) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <strong className={item.change < -25 ? 'severe' : ''}>{item.change}%</strong>
                <p>Projected survivors: {item.projected}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SimulationPage
