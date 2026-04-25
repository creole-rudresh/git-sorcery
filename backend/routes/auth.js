const express = require('express')
const bcrypt = require('bcryptjs')
const { db } = require('../db')

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
    res.status(201).json({ id: result.lastInsertRowid, username })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
