const express = require('express')
const { db } = require('../db')

const router = express.Router()

router.post('/register', (req, res) => {
  const { email, username, password } = req.body
  try {
    const stmt = db.prepare('INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)')
    const result = stmt.run(email, username, password)
    res.status(201).json({ id: result.lastInsertRowid, username })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
