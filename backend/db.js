// backend/db.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function initDB() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT DEFAULT 'นาย',
      name TEXT,
      student_id TEXT,
      email TEXT UNIQUE,
      password TEXT,
      phone TEXT,
      role TEXT DEFAULT 'USER',
      user_type TEXT DEFAULT 'นักศึกษา'
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      capacity INTEGER,
      image TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER,
      user_id INTEGER,
      booking_date TEXT,
      start_time TEXT,
      end_time TEXT,
      purpose TEXT,
      attendees_count INTEGER DEFAULT 1,
      status TEXT DEFAULT 'PENDING',
      FOREIGN KEY(room_id) REFERENCES rooms(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    -- 🛡️ ตารางเก็บประวัติผู้ที่สลับเข้าใช้งานหน้า Admin
    CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  return db;
}

module.exports = initDB;