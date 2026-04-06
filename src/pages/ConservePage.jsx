import { useMemo, useState } from 'react'
import SectionHeading from '../components/SectionHeading'

const PRESSURE_PATHWAYS = {
  'Habitat Fragmentation': {
    now: [
      'Map and mark wildlife movement corridors before new roads and buildings are approved.',
      'Prioritize native plant buffers around edges of forests, farms, and settlements.',
      'Stop grazing and extraction in recovery patches for at least one growth cycle.',
    ],
    longTerm: [
      'Establish legally protected habitat links between high-altitude and lower-elevation zones.',
      'Create corridor stewardship committees with village leaders and forest teams.',
      'Use biodiversity-sensitive land-use zoning in district development plans.',
    ],
    avoid: [
      'Avoid monoculture plantation drives that replace native habitat complexity.',
      'Avoid one-time plantation events without 2-3 year maintenance and survival audits.',
    ],
  },
  'Poaching and Illegal Trade': {
    now: [
      'Activate anonymous community reporting channels with rapid response follow-up.',
      'Increase patrol frequency in breeding grounds, ridge passes, and market routes.',
      'Coordinate local schools and tourism operators to flag suspicious activity.',
    ],
    longTerm: [
      'Build alternative livelihood programs in high-risk poaching zones.',
      'Digitize seizure records and pattern-map hotspots across seasons.',
      'Integrate wildlife crime prosecution support with local legal services.',
    ],
    avoid: [
      'Avoid community shaming approaches; they reduce reporting trust long term.',
      'Avoid isolated patrol actions without intelligence-sharing across regions.',
    ],
  },
  'Climate and Glacier Stress': {
    now: [
      'Protect climate refugia zones with strict seasonal disturbance controls.',
      'Monitor springs, snowmelt channels, and meadows with monthly citizen logs.',
      'Support assisted regeneration of temperature-sensitive native species.',
    ],
    longTerm: [
      'Develop adaptive ecosystem plans using 10-20 year warming scenarios.',
      'Diversify habitat structure to reduce single-point climate failures.',
      'Integrate climate migration corridors into state conservation plans.',
    ],
    avoid: [
      'Avoid fixed plans with no climate trigger thresholds for action updates.',
      'Avoid treating high-altitude systems as static; they are rapidly shifting.',
    ],
  },
  'Water and Wetland Degradation': {
    now: [
      'Fence critical wetland edges during breeding windows of vulnerable species.',
      'Remove local blockages affecting spring flow and marsh recharge.',
      'Control pollution points from camps, roads, and settlements near streams.',
    ],
    longTerm: [
      'Create watershed restoration plans linking wetlands, rivers, and alpine meadows.',
      'Set legal extraction limits and seasonal water-use restrictions.',
      'Build local wetland watch groups with schools and herder communities.',
    ],
    avoid: [
      'Avoid hard embankment-heavy interventions that disconnect floodplain ecology.',
      'Avoid tourism growth near wetlands without carrying-capacity controls.',
    ],
  },
}

const ROLE_ACTIONS = {
  Citizen: [
    'Report wildlife sightings and threats with location details and proof media.',
    'Choose verified eco-tourism operators that follow habitat-safe protocols.',
    'Support local conservation groups with recurring monthly contributions.',
  ],
  Student: [
    'Run biodiversity logbooks in your school/college with seasonal species counts.',
    'Host awareness drives on illegal wildlife product demand reduction.',
    'Join weekend native-plant restoration and cleanup campaigns.',
  ],
  Community: [
    'Create village-level no-disturbance windows during breeding/migration periods.',
    'Form corridor protection teams with clear rotation and escalation contacts.',
    'Coordinate grazing calendars that protect vulnerable habitat patches.',
  ],
  Policymaker: [
    'Tie district budgets to measurable biodiversity indicators, not only plantation counts.',
    'Mandate corridor impact assessments for all linear infrastructure projects.',
    'Publish open conservation dashboards with quarterly outcomes and actions.',
  ],
}

const FOCUS_ACTIONS = {
  Animals: [
    'Strengthen prey-base habitats and anti-poaching patrol intensity.',
    'Secure migration routes and conflict hotspots with local response teams.',
  ],
  Trees: [
    'Protect old-growth stands and seed-source trees from extraction.',
    'Replace monoculture plantations with mixed native species regeneration.',
  ],
  Plants: [
    'Guard medicinal plant hotspots from overharvesting and trampling.',
    'Establish seed banks and controlled propagation for rare alpine flora.',
  ],
}

function ConservePage() {
  const [activePressure, setActivePressure] = useState('Habitat Fragmentation')
  const [activeRole, setActiveRole] = useState('Citizen')
  const [activeFocus, setActiveFocus] = useState('Animals')
  const [checkedWays, setCheckedWays] = useState([])

  const pressureGuide = PRESSURE_PATHWAYS[activePressure]
  const roleGuide = ROLE_ACTIONS[activeRole]
  const focusGuide = FOCUS_ACTIONS[activeFocus]

  const interactiveWays = useMemo(
    () => [
      ...pressureGuide.now.slice(0, 2),
      ...roleGuide.slice(0, 2),
      ...focusGuide.slice(0, 2),
    ],
    [focusGuide, pressureGuide.now, roleGuide],
  )

  const readinessScore = useMemo(() => {
    if (!interactiveWays.length) return 0
    return Math.round((checkedWays.length / interactiveWays.length) * 100)
  }, [checkedWays.length, interactiveWays.length])

  function toggleWay(way) {
    setCheckedWays((prev) => (prev.includes(way) ? prev.filter((item) => item !== way) : [...prev, way]))
  }

  function resetChecklist() {
    setCheckedWays([])
  }

  return (
    <section className="page-panel conserve-page">
      <SectionHeading
        title="Conserve and Protect"
        subtitle="Simple, practical ways to protect species and biodiversity based on real pressure points"
      />

      <div className="conserve-hero glass">
        <div>
          <h3>Protection Guide</h3>
          <p>
            Choose threat, role, and biodiversity focus. Get clear tips for what to do now, what to build long-term,
            and what to avoid.
          </p>
        </div>
      </div>

      <div className="conserve-filter-band glass">
        <div>
          <small>Threat</small>
          <div className="conserve-chip-row">
            {Object.keys(PRESSURE_PATHWAYS).map((pressure) => (
              <button
                key={pressure}
                type="button"
                className={`impact-filter-btn ${activePressure === pressure ? 'active' : ''}`}
                onClick={() => {
                  setActivePressure(pressure)
                  setCheckedWays([])
                }}
              >
                {pressure}
              </button>
            ))}
          </div>
        </div>
        <div>
          <small>Your Role</small>
          <div className="conserve-chip-row">
            {Object.keys(ROLE_ACTIONS).map((role) => (
              <button
                key={role}
                type="button"
                className={`impact-filter-btn ${activeRole === role ? 'active' : ''}`}
                onClick={() => {
                  setActiveRole(role)
                  setCheckedWays([])
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
        <div>
          <small>Focus</small>
          <div className="conserve-chip-row">
            {Object.keys(FOCUS_ACTIONS).map((focus) => (
              <button
                key={focus}
                type="button"
                className={`impact-filter-btn ${activeFocus === focus ? 'active' : ''}`}
                onClick={() => {
                  setActiveFocus(focus)
                  setCheckedWays([])
                }}
              >
                {focus}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="conserve-guide-layout">
        <article className="conserve-guide-block glass">
          <h3>Do This Now</h3>
          <ul>
            {pressureGuide.now.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>

        <article className="conserve-guide-block glass">
          <h3>Build Over 6-24 Months</h3>
          <ul>
            {pressureGuide.longTerm.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>

        <article className="conserve-guide-block glass">
          <h3>Avoid These Mistakes</h3>
          <ul>
            {pressureGuide.avoid.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="conserve-layout">
        <article className="conserve-actions glass">
          <h3>Ways You Can Help ({activeRole})</h3>
          <ul className="conserve-ways-list">
            {roleGuide.map((way) => (
              <li key={way}>{way}</li>
            ))}
          </ul>

          <h4>{activeFocus} Priority</h4>
          <ul className="conserve-ways-list">
            {focusGuide.map((way) => (
              <li key={way}>{way}</li>
            ))}
          </ul>
        </article>

        <aside className="conserve-insights glass">
          <h3>Interactive Protection Checklist</h3>

          <div className="conserve-score-block">
            <small>Readiness</small>
            <strong>{readinessScore}%</strong>
            <div className="conserve-score-track">
              <span style={{ width: `${readinessScore}%` }} />
            </div>
          </div>

          <div className="conserve-checklist">
            {interactiveWays.map((way) => (
              <label key={way}>
                <input
                  type="checkbox"
                  checked={checkedWays.includes(way)}
                  onChange={() => toggleWay(way)}
                />
                <span>{way}</span>
              </label>
            ))}
          </div>

          <div className="conserve-tips">
            <h4>Improvement Tip</h4>
            <ul>
              {readinessScore < 50 ? (
                <li>Complete at least half of the checklist to build a realistic on-ground conservation routine.</li>
              ) : null}
              {readinessScore >= 50 && readinessScore < 100 ? (
                <li>Good momentum. Add one policy and one habitat action to improve long-term outcomes.</li>
              ) : null}
              {readinessScore === 100 ? (
                <li>Excellent. Convert this into a monthly community action sheet and start tracking outcomes.</li>
              ) : null}
            </ul>
          </div>

          <button type="button" className="ghost-btn" onClick={resetChecklist}>
            Reset Checklist
          </button>
        </aside>
      </div>
    </section>
  )
}

export default ConservePage
