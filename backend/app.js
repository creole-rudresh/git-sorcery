const express = require('express')
const cors = require('cors')
const authRouter = require('./routes/auth')
const historyRouter = require('./routes/history')

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/history', historyRouter)

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

module.exports = app
