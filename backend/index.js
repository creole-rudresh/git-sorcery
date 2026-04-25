const { initDB } = require('./db')
const app = require('./app')

const PORT = process.env.PORT || 4000

initDB()

app.listen(PORT, () => {
  console.log(`Weather backend running on http://localhost:${PORT}`)
  console.log('Endpoints: POST /api/auth/register, POST /api/auth/login, GET|POST|DELETE /api/history')
})
