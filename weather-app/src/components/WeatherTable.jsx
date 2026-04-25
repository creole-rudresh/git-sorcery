import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const WMO_CODES = {
  0: { label: 'Clear Sky', icon: '☀️' },
  1: { label: 'Mainly Clear', icon: '🌤' },
  2: { label: 'Partly Cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫' },
  48: { label: 'Icy Fog', icon: '🌫' },
  51: { label: 'Light Drizzle', icon: '🌦' },
  53: { label: 'Drizzle', icon: '🌦' },
  55: { label: 'Heavy Drizzle', icon: '🌧' },
  61: { label: 'Light Rain', icon: '🌧' },
  63: { label: 'Rain', icon: '🌧' },
  65: { label: 'Heavy Rain', icon: '🌧' },
  71: { label: 'Light Snow', icon: '🌨' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy Snow', icon: '❄️' },
  77: { label: 'Snow Grains', icon: '🌨' },
  80: { label: 'Light Showers', icon: '🌦' },
  81: { label: 'Showers', icon: '🌧' },
  82: { label: 'Heavy Showers', icon: '⛈' },
  85: { label: 'Snow Showers', icon: '🌨' },
  86: { label: 'Heavy Snow Showers', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈' },
  96: { label: 'Thunderstorm w/ Hail', icon: '⛈' },
  99: { label: 'Thunderstorm w/ Heavy Hail', icon: '⛈' },
}

function wmo(code) {
  return WMO_CODES[code] ?? { label: 'Unknown', icon: '❓' }
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

async function geocode(city) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  )
  if (!res.ok) throw new Error('Geocoding failed')
  const data = await res.json()
  if (!data.results?.length) throw new Error(`City "${city}" not found`)
  const { latitude, longitude, name, country } = data.results[0]
  return { latitude, longitude, name, country }
}

async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: [
      'weathercode',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'windspeed_10m_max',
      'uv_index_max',
      'relative_humidity_2m_max',
    ].join(','),
    timezone: 'auto',
    forecast_days: 7,
  })
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error('Weather fetch failed')
  return res.json()
}

export default function WeatherTable({ city }) {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setRows([])
    setLocation(null)

    geocode(city)
      .then(({ latitude, longitude, name, country }) => {
        setLocation({ name, country })
        if (user) {
          api.post('/history/save', { city: name, country, latitude, longitude }).catch(() => {})
        }
        return fetchWeather(latitude, longitude)
      })
      .then((data) => {
        if (cancelled) return
        const { time, weathercode, temperature_2m_max, temperature_2m_min,
          precipitation_sum, windspeed_10m_max, uv_index_max, relative_humidity_2m_max } = data.daily

        const today = new Date().toISOString().slice(0, 10)
        setRows(time.map((date, i) => ({
          date,
          isToday: date === today,
          ...wmo(weathercode[i]),
          tempHigh: temperature_2m_max[i],
          tempLow: temperature_2m_min[i],
          precip: precipitation_sum[i],
          wind: windspeed_10m_max[i],
          uv: uv_index_max[i],
          humidity: relative_humidity_2m_max[i],
        })))
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [city])

  if (loading) return <p className="status-msg">Fetching weather for <strong>{city}</strong>…</p>
  if (error) return <p className="error-msg">⚠️ {error}</p>

  return (
    <>
      {location && (
        <div className="city-info">
          <h2>{location.name}</h2>
          <span>{location.country}</span>
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Condition</th>
              <th>High (°C)</th>
              <th>Low (°C)</th>
              <th>Precip (mm)</th>
              <th>Wind (km/h)</th>
              <th>Humidity (%)</th>
              <th>UV Index</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.date} className={row.isToday ? 'today-row' : ''}>
                <td className="date-cell">
                  {formatDate(row.date)}
                  {row.isToday && <span className="today-badge">Today</span>}
                </td>
                <td>
                  <span className="weather-icon">{row.icon}</span>{' '}
                  {row.label}
                </td>
                <td className="temp-high">{row.tempHigh ?? '—'}°</td>
                <td className="temp-low">{row.tempLow ?? '—'}°</td>
                <td className="precip">{row.precip ?? '—'}</td>
                <td className="wind-speed">{row.wind ?? '—'}</td>
                <td className="humidity">{row.humidity ?? '—'}</td>
                <td className="uv-index">{row.uv ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="footer-note">Data source: Open-Meteo (open-meteo.com) — Free &amp; no API key required</p>
    </>
  )
}
