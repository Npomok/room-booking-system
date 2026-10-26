//ตรวจสอบสิทธิ์การเข้าถึงข้อมูล


const jwt = require('jsonwebtoken');


// verifyToken ตรวจสอบคนที่เข้ามา login ว่ามีToken ถูกต้องไหม
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token ไม่ถูกต้อง' });
    req.user = user;
    next();
  });
}


//verifyAdmin ตรวจสอบผู้ใช้งานมีสิทธิ์เป็น ADMIN ไหม
function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'สำหรับแอดมินเท่านั้น' });
    }
    next();
  });
}

module.exports = { verifyToken, verifyAdmin };