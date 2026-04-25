const express = require('express')
const authMiddleware = require('../middleware/auth')
const { db } = require('../db')

const router = express.Router()
router.use(authMiddleware)

router.get('/', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM weather_history WHERE user_id = ? ORDER BY searched_at DESC LIMIT 20'
  ).all(req.user.userId)
  res.json(rows)
})

router.post('/save', (req, res) => {
  const { city, country, latitude, longitude } = req.body
  if (!city) return res.status(400).json({ error: 'City is required' })
  const stmt = db.prepare(
    'INSERT INTO weather_history (user_id, city, country, latitude, longitude) VALUES (?, ?, ?, ?, ?)'
  )
  const result = stmt.run(req.user.userId, city, country || null, latitude || null, longitude || null)
  res.status(201).json({ id: result.lastInsertRowid, city })
})

router.delete('/:id', (req, res) => {
  const result = db.prepare(
    'DELETE FROM weather_history WHERE id = ? AND user_id = ?'
  ).run(req.params.id, req.user.userId)
  if (result.changes === 0) return res.status(404).json({ error: 'Record not found' })
  res.json({ success: true })
})

module.exports = router
