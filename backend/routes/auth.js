const express = require('express')
const { db } = require('../db')

const router = express.Router()

router.post('/register', (req, res) => {
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
  try {
    const stmt = db.prepare('INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)')
    const result = stmt.run(email, username, password)
    res.status(201).json({ id: result.lastInsertRowid, username })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
