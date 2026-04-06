import { useMemo } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { REGIONS, SPECIES, STATUS_COLOR } from './data/himalayaData'
import useLiveConservationData from './hooks/useLiveConservationData'
import ExplorePage from './pages/ExplorePage'
import FoodChainPage from './pages/FoodChainPage'
import ConservePage from './pages/ConservePage'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import SimulationPage from './pages/SimulationPage'
import TrackerPage from './pages/TrackerPage'
import { computeTrackerMetrics } from './utils/biodiversity'
import './App.css'

function App() {
  const trackerMetrics = useMemo(() => computeTrackerMetrics(SPECIES), [])
  const { loading, error, liveData } = useLiveConservationData(REGIONS, SPECIES)

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={
            <HomePage
              regionCount={REGIONS.length}
              speciesCount={SPECIES.length}
              trackerMetrics={trackerMetrics}
              liveData={liveData}
              loading={loading}
            />
          }
        />
        <Route
          path="/map"
          element={<MapPage regions={REGIONS} species={SPECIES} liveData={liveData} loading={loading} />}
        />
        <Route path="/explore" element={<ExplorePage regions={REGIONS} species={SPECIES} statusColor={STATUS_COLOR} />} />
        <Route path="/conserve" element={<ConservePage />} />
        <Route path="/food-chain" element={<FoodChainPage />} />
        <Route
          path="/tracker"
          element={
            <TrackerPage
              species={SPECIES}
              trackerMetrics={trackerMetrics}
              liveData={liveData}
              loading={loading}
              error={error}
            />
          }
        />
        <Route
          path="/simulation"
          element={<SimulationPage species={SPECIES} liveData={liveData} loading={loading} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
