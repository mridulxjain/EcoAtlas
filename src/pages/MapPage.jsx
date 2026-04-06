import { useEffect, useMemo, useState } from 'react'
import {
  CircleMarker,
  LayerGroup,
  LayersControl,
  MapContainer,
  Polygon,
  Popup,
  ScaleControl,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import SectionHeading from '../components/SectionHeading'

const HIMALAYA_BOUNDS = [
  [26.6, 75.4],
  [35.9, 89.9],
]

const REGION_POLYGONS = {
  ladakh: [
    [34.9, 75.6],
    [35.5, 77.3],
    [34.6, 79.6],
    [33.3, 79.2],
    [33.0, 77.1],
  ],
  himachal: [
    [32.8, 75.8],
    [32.2, 77.9],
    [31.7, 78.7],
    [30.8, 78.2],
    [30.8, 76.7],
    [31.6, 76.0],
  ],
  uttarakhand: [
    [31.3, 78.1],
    [31.1, 80.2],
    [30.2, 80.3],
    [29.4, 79.9],
    [29.2, 78.4],
    [30.1, 77.9],
  ],
  sikkim: [
    [28.1, 88.1],
    [28.0, 88.8],
    [27.5, 88.9],
    [27.2, 88.6],
    [27.1, 88.2],
    [27.5, 88.0],
  ],
}

function MapNavigator({ activeRegion, mapCommand }) {
  const map = useMap()

  useEffect(() => {
    if (!mapCommand?.type || !activeRegion) return

    if (mapCommand.type === 'all') {
      map.fitBounds(HIMALAYA_BOUNDS, { padding: [28, 28], maxZoom: 8 })
      return
    }

    map.flyTo([activeRegion.lat, activeRegion.lng], activeRegion.zoom ?? 7, {
      duration: 0.9,
    })
  }, [map, activeRegion, mapCommand])

  return null
}

function MapPage({ regions, species, liveData, loading }) {
  const [activeRegionId, setActiveRegionId] = useState(regions[0]?.id ?? '')
  const [mapCommand, setMapCommand] = useState({ type: 'all', nonce: 0 })

  const activeRegion = useMemo(
    () => regions.find((region) => region.id === activeRegionId) ?? regions[0],
    [activeRegionId, regions],
  )

  const regionSpecies = useMemo(
    () => species.filter((item) => item.region === activeRegion?.name),
    [species, activeRegion],
  )

  const regionStats = useMemo(() => {
    const animals = regionSpecies.filter((item) => item.type === 'Animal').length
    const trees = regionSpecies.filter((item) => item.type === 'Tree').length
    const plants = regionSpecies.filter((item) => item.type === 'Plant').length
    const endangered = regionSpecies.filter(
      (item) => item.status === 'Endangered' || item.status === 'Critically Endangered',
    ).length
    const highRisk = regionSpecies.filter((item) => item.risk === 'High' || item.risk === 'Critical').length
    return { animals, trees, plants, endangered, highRisk }
  }, [regionSpecies])

  const regionClimate = useMemo(
    () => liveData?.climate?.find((item) => item.region === activeRegion?.name),
    [liveData, activeRegion],
  )

  const priorityThreats = useMemo(() => {
    const counters = {
      'Habitat Fragmentation': 0,
      'Climate Stress': 0,
      'Extraction Pressure': 0,
      'Human Disturbance': 0,
    }

    regionSpecies.forEach((item) => {
      const text = item.threats.toLowerCase()
      if (text.includes('fragment') || text.includes('road') || text.includes('degradation')) {
        counters['Habitat Fragmentation'] += 1
      }
      if (text.includes('warming') || text.includes('temperature') || text.includes('climate')) {
        counters['Climate Stress'] += 1
      }
      if (text.includes('poaching') || text.includes('hunting') || text.includes('overharvesting')) {
        counters['Extraction Pressure'] += 1
      }
      if (text.includes('tourism') || text.includes('disturbance') || text.includes('grazing')) {
        counters['Human Disturbance'] += 1
      }
    })

    return Object.entries(counters)
      .sort((a, b) => b[1] - a[1])
      .filter((item) => item[1] > 0)
      .slice(0, 3)
  }, [regionSpecies])

  const habitatHighlights = useMemo(
    () => [...new Set(regionSpecies.map((item) => item.habitat))].slice(0, 3),
    [regionSpecies],
  )

  const regionNarrative = useMemo(() => {
    if (!activeRegion) return ''
    const topThreat = priorityThreats[0]?.[0] ?? 'multi-factor ecological stress'
    return `${activeRegion.name} currently carries ${regionStats.endangered} endangered profiles and ${regionStats.highRisk} high-risk taxa in this tracker. The strongest pressure signal is ${topThreat}, with cascading risk across alpine food webs and long-term habitat stability.`
  }, [activeRegion, priorityThreats, regionStats])

  return (
    <section className="page-panel">
      <SectionHeading
        title="Interactive Northern Himalaya Map"
        subtitle="Detailed map with layer switcher, region boundaries, and biodiversity hotspots"
      />

      <div className="map-toolbar">
        <div className="region-switcher">
          {regions.map((region) => (
            <button
              key={region.id}
              type="button"
              className={`region-switch-btn ${activeRegion?.id === region.id ? 'active' : ''}`}
              onClick={() => {
                setActiveRegionId(region.id)
                setMapCommand({ type: 'region', nonce: Date.now() })
              }}
            >
              {region.name}
            </button>
          ))}
        </div>

        <div className="map-actions">
          <button
            type="button"
            className="map-action-btn"
            onClick={() => setMapCommand({ type: 'all', nonce: Date.now() })}
          >
            View All Himalayas
          </button>
          <button
            type="button"
            className="map-action-btn"
            onClick={() => setMapCommand({ type: 'region', nonce: Date.now() })}
          >
            Focus Active Region
          </button>
        </div>
      </div>

      <div className="map-layout map-route-layout">
        <div className="map-real glass">
          <MapContainer bounds={HIMALAYA_BOUNDS} scrollWheelZoom className="leaflet-container">
            <ScaleControl position="bottomleft" />
            <MapNavigator activeRegion={activeRegion} mapCommand={mapCommand} />

            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OSM Street">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Satellite (Esri)">
                <TileLayer
                  attribution='Tiles &copy; Esri'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Topographic">
                <TileLayer
                  attribution='Map data: &copy; OpenStreetMap contributors, SRTM | style: &copy; OpenTopoMap'
                  url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Dark Terrain">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
              </LayersControl.BaseLayer>

              <LayersControl.Overlay checked name="Region Boundaries">
                <LayerGroup>
                  {regions.map((region) => {
                    const polygon = REGION_POLYGONS[region.id]
                    if (!polygon) return null
                    return (
                      <Polygon
                        key={`${region.id}-poly`}
                        positions={polygon}
                        pathOptions={{
                          color: region.id === activeRegion?.id ? '#f3d07f' : '#86c995',
                          weight: region.id === activeRegion?.id ? 2.4 : 1.4,
                          fillColor: region.id === activeRegion?.id ? '#f1c56c' : '#80b68b',
                          fillOpacity: region.id === activeRegion?.id ? 0.22 : 0.09,
                        }}
                        eventHandlers={{ click: () => setActiveRegionId(region.id) }}
                      >
                        <Tooltip sticky>{region.name}</Tooltip>
                      </Polygon>
                    )
                  })}
                </LayerGroup>
              </LayersControl.Overlay>

              <LayersControl.Overlay checked name="Biodiversity Hotspots">
                <LayerGroup>
                  {regions.map((region) => {
                    const count = species.filter((item) => item.region === region.name).length
                    return (
                      <CircleMarker
                        key={region.id}
                        center={[region.lat, region.lng]}
                        radius={Math.max(8, count * 2.5)}
                        pathOptions={{
                          color: region.id === activeRegion?.id ? '#f3d07f' : '#99d5a5',
                          fillColor: region.id === activeRegion?.id ? '#f6cb76' : '#79b287',
                          fillOpacity: 0.42,
                        }}
                        eventHandlers={{ click: () => setActiveRegionId(region.id) }}
                      >
                        <Popup>
                          <h4>{region.name}</h4>
                          <p>{count} tracked species</p>
                          <p>
                            Center: {region.lat.toFixed(2)}, {region.lng.toFixed(2)}
                          </p>
                        </Popup>
                      </CircleMarker>
                    )
                  })}
                </LayerGroup>
              </LayersControl.Overlay>
            </LayersControl>

            <div className="map-legend">
              <strong>Hotspot Size</strong>
              <span>larger circle = more tracked species</span>
            </div>
          </MapContainer>
        </div>

        <article className="region-card glass">
          <h3>{activeRegion?.name}</h3>
          <p>{activeRegion?.blurb}</p>

          <div className="region-detail-grid">
            <div>
              <small>Latitude</small>
              <strong>{activeRegion?.lat?.toFixed(3)}</strong>
            </div>
            <div>
              <small>Longitude</small>
              <strong>{activeRegion?.lng?.toFixed(3)}</strong>
            </div>
            <div>
              <small>Animals</small>
              <strong>{regionStats.animals}</strong>
            </div>
            <div>
              <small>Trees + Plants</small>
              <strong>{regionStats.trees + regionStats.plants}</strong>
            </div>
            <div>
              <small>Endangered</small>
              <strong>{regionStats.endangered}</strong>
            </div>
            <div>
              <small>High Risk</small>
              <strong>{regionStats.highRisk}</strong>
            </div>
          </div>

          <p className="region-story">{regionNarrative}</p>

          <div className="detail-stack">
            <section className="insight-card">
              <h4>Live Climate Snapshot</h4>
              {loading ? (
                <p>Loading regional climate signal...</p>
              ) : (
                <div className="climate-badges">
                  <span>Temp: {regionClimate?.temperature?.toFixed(1) ?? 'N/A'} C</span>
                  <span>Precip: {regionClimate?.precipitation ?? 'N/A'} mm</span>
                  <span>Snowfall: {regionClimate?.snowfall ?? 'N/A'} cm</span>
                </div>
              )}
            </section>

            <section className="insight-card">
              <h4>Dominant Pressures</h4>
              <ul className="insight-list">
                {priorityThreats.length === 0 ? (
                  <li>No dominant pressure detected yet</li>
                ) : (
                  priorityThreats.map(([threat, count]) => <li key={threat}>{threat} ({count})</li>)
                )}
              </ul>
            </section>

            <section className="insight-card">
              <h4>Habitat Highlights</h4>
              <ul className="insight-list">
                {habitatHighlights.map((habitat) => (
                  <li key={habitat}>{habitat}</li>
                ))}
              </ul>
            </section>
          </div>

          <ul>
            <li>
              <strong>Terrain:</strong> {activeRegion?.terrain}
            </li>
            <li>
              <strong>Altitude:</strong> {activeRegion?.altitude}
            </li>
            <li>
              <strong>Species in view:</strong> {regionSpecies.length}
            </li>
          </ul>
          <div className="chip-row">
            {regionSpecies.map((item) => (
              <span key={item.id} className="chip chip-btn">
                {item.name}
              </span>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

export default MapPage
