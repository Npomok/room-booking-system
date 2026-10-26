// backend/routes/bookings.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');

module.exports = (db) => {
  // 📅 API จองห้อง
  router.post('/', verifyToken, async (req, res) => {
    const { room_id, booking_date, start_time, end_time, purpose, attendees_count } = req.body;
    const user_id = req.user.id;

    // เช็กช่วงเวลาทับซ้อน
    const conflict = await db.get(
      `SELECT * FROM bookings 
       WHERE room_id = ? AND booking_date = ? AND status != 'REJECTED' AND status != 'CANCELLED'
       AND (start_time < ? AND end_time > ?)`,
      [room_id, booking_date, end_time, start_time]
    );

    if (conflict) {
      return res.status(409).json({ message: 'ช่วงเวลานี้มีผู้ใช้งานอื่นจองไว้แล้ว กรุณาเลือกช่วงเวลาอื่น' });
    }

    await db.run(
      `INSERT INTO bookings (room_id, user_id, booking_date, start_time, end_time, purpose, attendees_count, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [room_id, user_id, booking_date, start_time, end_time, purpose, attendees_count || 1]
    );

    res.json({ message: 'ส่งคำขอจองห้องสำเร็จ' });
  });

  // 🔍 ดึงรายการจองทั้งหมด
  router.get('/', async (req, res) => {
    const bookings = await db.all(`
      SELECT b.id, b.booking_date, b.start_time, b.end_time, b.purpose, b.status, b.attendees_count,
             u.id as user_id, u.title, u.name as user_name, u.email as user_email, u.phone, u.user_type, u.student_id,
             r.name as room_name, r.id as room_id
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.booking_date DESC, b.start_time ASC
    `);
    res.json(bookings);
  });

  // 🗑️ [NEW] ลบรายการจองออกจากฐานข้อมูล
  router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
      await db.run(`DELETE FROM bookings WHERE id = ?`, [req.params.id]);
      res.json({ message: 'ลบรายการจองเรียบร้อยแล้ว' });
    } catch (err) {
      res.status(500).json({ message: 'ไม่สามารถลบรายการได้' });
    }
  });

  // [ADMIN] อัปเดตสถานะการจอง
  router.put('/:id/status', verifyAdmin, async (req, res) => {
    const { status } = req.body;
    await db.run(`UPDATE bookings SET status = ? WHERE id = ?`, [status, req.params.id]);
    res.json({ message: `อัปเดตสถานะการจองเรียบร้อยแล้ว` });
  });

  return router;
};