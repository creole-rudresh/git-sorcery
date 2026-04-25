const { initDB } = require('./db')
const app = require('./app')

const PORT = process.env.PORT || 4000

initDB()

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
