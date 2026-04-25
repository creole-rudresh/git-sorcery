const Database = require('better-sqlite3')
const path = require('path')

const dbPath = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : path.join(__dirname, 'weather.db')

const db = new Database(dbPath)

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
  if (process.env.NODE_ENV !== 'test') {
    console.log('Database tables ready')
  }
}

function clearDB() {
  db.exec('DELETE FROM weather_history')
  db.exec('DELETE FROM users')
}

module.exports = { db, initDB, clearDB }
