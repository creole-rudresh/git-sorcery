import { useState } from 'react'
import WeatherTable from './components/WeatherTable'
import Login from './components/Login'
import Register from './components/Register'
import { useAuth } from './context/AuthContext'
import './App.css'
import './auth.css'

function LogoutBtn() {
  const { logout } = useAuth()
  return <button className="logout-btn" onClick={logout}>Sign Out</button>
}

function App() {
  const { user } = useAuth()
  const [authView, setAuthView] = useState('login')
  const [city, setCity] = useState('London')
  const [input, setInput] = useState('London')
  const [theme, setTheme] = useState('night')

  const handleSearch = (e) => {
    e.preventDefault()
    if (input.trim()) setCity(input.trim())
  }

  if (!user) {
    return (
      <div className={`app theme-${theme}`}>
        <header className="app-header">
          <div className="header-top">
            <h1>{theme === 'night' ? '🌙' : '☀️'} Weather Dashboard</h1>
            <button className="theme-toggle" onClick={() => setTheme(t => t === 'night' ? 'day' : 'night')}>
              {theme === 'night' ? '☀️ Day' : '🌙 Night'}
            </button>
          </div>
          <p className="subtitle">Sign in to track your weather searches</p>
        </header>
        <div className="auth-container">
          {authView === 'login'
            ? <Login onSwitch={() => setAuthView('register')} />
            : <Register onSwitch={() => setAuthView('login')} />}
        </div>
      </div>
    )
  }

  return (
    <div className={`app theme-${theme}`}>
      <header className="app-header">
        <div className="header-top">
          <h1>{theme === 'night' ? '🌙' : '☀️'} Weather Dashboard</h1>
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'night' ? 'day' : 'night')}
            aria-label="Toggle theme"
          >
            {theme === 'night' ? '☀️ Day' : '🌙 Night'}
          </button>
        </div>
        <p className="subtitle">7-Day Forecast powered by Open-Meteo &amp; Geocoding API</p>
      </header>

      <div className="user-bar">
        <span className="user-greeting">👋 Welcome, <strong>{user.username}</strong></span>
        <LogoutBtn />
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="Enter city name..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="search-btn">Search</button>
      </form>

      <WeatherTable city={city} />
    </div>
  )
}

export default App
