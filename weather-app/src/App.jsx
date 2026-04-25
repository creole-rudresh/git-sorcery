import { useState } from 'react'
import WeatherTable from './components/WeatherTable'
import './App.css'

function App() {
  const [city, setCity] = useState('London')
  const [input, setInput] = useState('London')

  const handleSearch = (e) => {
    e.preventDefault()
    if (input.trim()) setCity(input.trim())
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌤 Weather Dashboard</h1>
        <p className="subtitle">7-Day Forecast powered by Open-Meteo &amp; Geocoding API</p>
      </header>

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
