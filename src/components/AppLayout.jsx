import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/map', label: 'Map' },
  { to: '/explore', label: 'Explore' },
  { to: '/tracker', label: 'Tracker' },
  { to: '/simulation', label: 'Simulation' },
]

function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()

  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <div className="hima-page">
      <div className="aurora aurora-1" aria-hidden="true" />
      <div className="aurora aurora-2" aria-hidden="true" />

      <header className={`top-nav ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="brand">EcoAtlas</div>
        <button
          type="button"
          className={`nav-toggle ${isMenuOpen ? 'open' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav id="main-navigation" className={isMenuOpen ? 'open' : ''}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              end={item.to === '/'}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
