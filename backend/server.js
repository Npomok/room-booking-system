// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken'); // 👈 นำเข้า jwt ด้านบนสุด
const initDB = require('./db');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

initDB().then((db) => {
  // 🔑 API สลับเข้าโหมด Admin (ตรวจสอบรหัสผ่านตรงกับไฟล์ .env)
  app.post('/api/auth/admin-login', async (req, res) => {
    try {
      const { password, userId } = req.body;
      const envPassword = process.env.ADMIN_PASSWORD || '123456';

      // 1. ตรวจสอบรหัสผ่านตรงกับไฟล์ .env
      if (password !== envPassword) {
        return res.status(403).json({ message: 'รหัสผ่าน Admin ไม่ถูกต้อง!' });
      }

      // 2. เก็บบันทึกประวัติการเข้าใช้งานหน้า Admin
      if (userId) {
        try {
          await db.run(`INSERT INTO admin_logs (user_id) VALUES (?)`, [userId]);
        } catch (err) {
          console.error('Log error:', err);
        }
      }

      // 3. สร้าง Token
      const token = jwt.sign(
        { id: userId || 0, role: 'ADMIN' },
        process.env.JWT_SECRET || 'super_secret_jwt_key_uniroom_2026',
        { expiresIn: '1d' }
      );

      res.json({
        token,
        user: { id: userId || 0, role: 'ADMIN', user_type: 'บุคลากร' }
      });
    } catch (err) {
      console.error('Admin Login Error:', err);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
    }
  });

  app.use('/api/auth', require('./routes/auth')(db));
  app.use('/api/rooms', require('./routes/rooms')(db));
  app.use('/api/bookings', require('./routes/bookings')(db));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Database Connection Error:', err);
});