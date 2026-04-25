const express = require('express')
const cors = require('cors')
const { initDB } = require('./db')

const app = express()
const PORT = 4000

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

initDB()

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
