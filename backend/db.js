const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'weather.db'))

function initDB() {
  console.log('Database initialized')
}

module.exports = { db, initDB }
