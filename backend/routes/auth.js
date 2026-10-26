// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (db) => {
  // สมัครสมาชิก
  router.post('/register', async (req, res) => {
    const { title, name, student_id, phone, email, password, user_type } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    if (user_type === 'นักศึกษา' && !student_id) {
      return res.status(400).json({ message: 'กรุณากรอกรหัสนิสิตด้วยครับ' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      await db.run(
        `INSERT INTO users (title, name, student_id, phone, email, password, role, user_type) 
         VALUES (?, ?, ?, ?, ?, ?, 'USER', ?)`,
        [title || 'นาย', name, user_type === 'นักศึกษา' ? student_id : '', phone, email, hashedPassword, user_type || 'นักศึกษา']
      );
      res.json({ message: 'ลงทะเบียนสำเร็จ' });
    } catch (err) {
      res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }
  });

  // เข้าสู่ระบบ
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);

    if (!user) return res.status(400).json({ message: 'ไม่พบผู้ใช้งานนี้' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้อง' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: `${user.title || ''} ${user.name}` },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        title: user.title,
        name: user.name,
        fullName: `${user.title || ''} ${user.name}`,
        student_id: user.student_id,
        phone: user.phone,
        email: user.email, 
        role: user.role,
        user_type: user.user_type || 'นักศึกษา'
      } 
    });
  });

  // 🛡️ ดึงรายชื่อผู้ใช้งานทั้งหมดที่เคยสลับเข้าใช้งานหน้า Admin
  router.get('/admins', async (req, res) => {
    try {
      const admins = await db.all(`
        SELECT DISTINCT u.id, u.title, u.name, u.email, u.phone, u.user_type, u.student_id
        FROM users u
        LEFT JOIN admin_logs l ON u.id = l.user_id
        WHERE u.role = 'ADMIN' OR l.id IS NOT NULL
      `);
      res.json(admins);
    } catch (err) {
      res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลได้' });
    }
  });

  return router;
};