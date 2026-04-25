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
  db.exec(`
    CREATE TABLE IF NOT EXISTS weather_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      city TEXT NOT NULL,
      country TEXT,
      latitude REAL,
      longitude REAL,
      searched_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)
  console.log('Database tables ready')
}

module.exports = { db, initDB }
