import { useEffect, useState } from 'react'
import api from '../api'

export default function WeatherHistory({ onSelect }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/history')
      .then(res => setHistory(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleDelete(id) {
    api.delete(`/history/${id}`)
      .then(() => setHistory(h => h.filter(r => r.id !== id)))
      .catch(() => {})
  }

  if (loading) return <p className="history-loading">Loading history…</p>
  if (!history.length) return <p className="history-empty">No searches yet.</p>

  return (
    <div className="history-panel">
      <h3>Recent Searches</h3>
      <ul className="history-list">
        {history.map(item => (
          <li key={item.id} className="history-item">
            <button className="history-city-btn" onClick={() => onSelect(item.city)}>
              <span className="history-city">{item.city}</span>
              {item.country && <span className="history-country">{item.country}</span>}
              <span className="history-date">{new Date(item.searched_at).toLocaleDateString()}</span>
            </button>
            <button className="history-delete-btn" onClick={() => handleDelete(item.id)} title="Remove">✕</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
