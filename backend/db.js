const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'weather.db'))

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)
  console.log('Users table ready')
}

module.exports = { db, initDB }
