const express = require('express')
const cors = require('cors')
const { initDB } = require('./db')
const authRouter = require('./routes/auth')
const historyRouter = require('./routes/history')

const app = express()
const PORT = 4000

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

initDB()

app.use('/api/auth', authRouter)
app.use('/api/history', historyRouter)

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
