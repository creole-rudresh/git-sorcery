const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { db } = require('../db')

const JWT_SECRET = 'weather_jwt_secret_2024'

const router = express.Router()

router.post('/register', async (req, res) => {
  const { email, username, password } = req.body
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'All fields are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' })
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' })
  }
  try {
    const hash = await bcrypt.hash(password, 10)
    const stmt = db.prepare('INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)')
    const result = stmt.run(email, username, hash)
    const token = jwt.sign({ userId: result.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '7d' })
  res.status(201).json({ token, username })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, username: user.username })
})

module.exports = router
