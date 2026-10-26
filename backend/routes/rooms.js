// สิทธิ์ Admin 
const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');

module.exports = (db) => {
  // ดึงรายการห้องทั้งหมด
  router.get('/', async (req, res) => {
    const rooms = await db.all(`SELECT * FROM rooms`);
    res.json(rooms);
  });

  // เพิ่มห้องใหม่
  router.post('/', verifyAdmin, async (req, res) => {
    const { name, capacity, image, description } = req.body;
    await db.run(
      `INSERT INTO rooms (name, capacity, image, description) VALUES (?, ?, ?, ?)`,
      [name, capacity, image, description]
    );
    res.json({ message: 'เพิ่มห้องสำเร็จ' });
  });

  //   แก้ไขข้อมูลห้อง
  router.put('/:id', verifyAdmin, async (req, res) => {
    const { name, capacity, image, description } = req.body;
    await db.run(
      `UPDATE rooms SET name = ?, capacity = ?, image = ?, description = ? WHERE id = ?`,
      [name, capacity, image, description, req.params.id]
    );
    res.json({ message: 'แก้ไขข้อมูลห้องสำเร็จ' });
  });

  //   ลบห้องออกจากระบบ
  router.delete('/:id', verifyAdmin, async (req, res) => {
    await db.run(`DELETE FROM rooms WHERE id = ?`, [req.params.id]);
    res.json({ message: 'ลบห้องเรียบร้อยแล้ว' });
  });

  return router;
};