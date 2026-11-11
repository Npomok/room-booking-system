import buildingImg from './assets/buildsci.jpg';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useLocation, useParams } from 'react-router-dom';
import { 
  Eye, EyeOff, Search, Calendar, User, Clock, Building2, LogOut, 
  Check, Shield, GraduationCap, Briefcase, Lock, X, CheckCircle, XCircle, 
  Trash2, Edit3, BarChart3, CheckSquare, Clock3, Upload, FileText, Send, UserCheck, AlertTriangle, Users
} from 'lucide-react';
import { 
  loginUser, registerUser, adminLogin, fetchAdmins, fetchRooms, fetchBookings, 
  createBooking, addRoom, updateRoom, deleteRoom, updateBookingStatus, deleteBooking 
} from './services/api';

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState('');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('savedUser');
    setUser(null);
  };

  const handleRoleToggleClick = () => {
    if (user?.role === 'ADMIN') {
      const savedUser = JSON.parse(localStorage.getItem('savedUser'));
      if (savedUser) {
        setUser(savedUser);
        localStorage.setItem('user', JSON.stringify(savedUser));
      } else {
        alert('กรุณาล็อกอินใหม่อีกครั้ง');
        logout();
      }
    } else {
      setAdminError('');
      setAdminPasswordInput('');
      setIsAdminModalOpen(true);
    }
  };

  const handleVerifyAdminPassword = async (e) => {
    e.preventDefault();
    setAdminError('');

    try {
      const res = await adminLogin(adminPasswordInput, user?.id);
      localStorage.setItem('token', res.data.token);
      
      if (user && user.role !== 'ADMIN') {
        localStorage.setItem('savedUser', JSON.stringify(user));
      }

      const adminUserObj = {
        ...res.data.user,
        role: 'ADMIN'
      };

      localStorage.setItem('user', JSON.stringify(adminUserObj));
      setUser(adminUserObj);
      setIsAdminModalOpen(false);
    } catch (err) {
      setAdminError(err.response?.data?.message || 'รหัสผ่าน Admin ไม่ถูกต้อง!');
    }
  };

  const getUserBadgeDetails = (u) => {
    if (u?.role === 'ADMIN') {
      return { 
        icon: <Shield className="w-4 h-4 text-amber-600" />, 
        label: 'ผู้ดูแลระบบ', 
        bg: 'bg-amber-100' 
      };
    }
    if (u?.user_type === 'บุคลากร') {
      return { 
        icon: <Briefcase className="w-4 h-4 text-emerald-600" />, 
        label: 'บุคลากร / อาจารย์', 
        bg: 'bg-emerald-100'  
      };
    }
    return { 
      icon: <GraduationCap className="w-4 h-4 text-indigo-600" />, 
      label: 'นักศึกษา', 
      bg: 'bg-indigo-100' 
    };
  };

  const badge = getUserBadgeDetails(user);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased relative">
        
        {isAdminModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Lock className="w-5 h-5 text-amber-500" /> ยืนยันสิทธิ์ผู้ดูแลระบบ
                </div>
                <button onClick={() => setIsAdminModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">กรุณากรอกรหัสผ่านลับสำหรับผู้ดูแลระบบ</p>

              {adminError && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200 font-medium">
                  ⚠️ {adminError}
                </div>
              )}

              <form onSubmit={handleVerifyAdminPassword} className="space-y-4">
                <div className="relative">
                  <input 
                    type={showAdminPass ? "text" : "password"} 
                    placeholder="รหัสผ่าน Admin" 
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs pr-10 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    autoFocus
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showAdminPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAdminModalOpen(false)}
                    className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit" 
                    className="w-1/2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition"
                  >
                    ยืนยันรหัสผ่าน
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-indigo-950 tracking-tight leading-none">อุทยาน วิทยาศาสตร์</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">ระบบจองห้องออนไลน์มหาวิทยาลัย</p>
              </div>
            </Link>

            <NavigationTabs user={user} />

            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-full border border-slate-200/80 transition cursor-pointer">
                    <div className={`w-8 h-8 ${badge.bg} rounded-full flex items-center justify-center shadow-sm`}>
                      {badge.icon}
                    </div>
                    <div className="text-left leading-tight pr-1">
                      <div className="text-xs font-bold text-slate-800">{user.title ? `${user.title} ${user.name}` : user.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{badge.label}</div>
                    </div>
                  </div>
                  <button 
                    onClick={logout}
                    title="ออกจากระบบ"
                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition">
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <section className="bg-[#0b1329] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs px-3 py-1 rounded-full font-medium mb-3">
                <Check className="w-3.5 h-3.5" /> ระบบจองห้องออนไลน์เวอร์ชันใหม่
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                ค้นหาและจองห้องเรียน / ห้องประชุม
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-2xl">
                ตรวจสอบตารางเวลาว่าง จองง่าย สะดวกรวดเร็วสำหรับนักศึกษาและบุคลากร
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-4 shadow-xl">
              <div className="text-right">
                <div className="text-[11px] text-slate-400">สถานะระบบปัจจุบัน:</div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">
                  โหมด <span className={user?.role === 'ADMIN' ? 'text-amber-400 font-bold' : 'text-indigo-400'}>{user?.role === 'ADMIN' ? 'ผู้ดูแลระบบ (Admin)' : `${user?.user_type || 'ผู้ใช้ทั่วไป'} (User)`}</span>
                </div>
              </div>
              <button 
                onClick={handleRoleToggleClick}
                className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5"
              >
                {user?.role === 'ADMIN' ? 'กลับเป็น User' : <><Lock className="w-3.5 h-3.5 text-amber-600" /> สลับเป็น Admin</>}
              </button>
            </div>
          </div>
        </section>

        {/* Content Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<RoomListPage user={user} />} />
            <Route path="/schedule" element={<SchedulePage user={user} />} />
            <Route path="/my-bookings" element={<MyBookingsPage user={user} />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/book/:roomId" element={user ? <BookingPage user={user} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function NavigationTabs({ user }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { label: 'รายการห้องทั้งหมด', path: '/' },
    { label: 'ตารางการใช้งาน', path: '/schedule' },
    { label: 'การจองของฉัน', path: '/my-bookings' },
    { label: 'แผนที่อาคาร', path: '/map' },
  ];

  if (user?.role === 'ADMIN') {
    tabs.push({ label: 'จัดการหลังบ้าน Admin', path: '/admin' });
  }

  return (
    <nav className="flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
      {tabs.map((tab) => {
        const isActive = currentPath === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

// ----------------------------------------------------------------------
// 📅 1. หน้าตารางการใช้งาน (รูปที่ 1 - แสดงข้อมูลรายละเอียด ชัดเจน ไร้คำขอที่โดนปฏิเสธ)
// ----------------------------------------------------------------------

function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState('2026-10-27');
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings().then(res => setBookings(res.data)).catch(() => setBookings([]));
  }, []);

  // 🛡️ ซ่อนรายการที่โดนปฏิเสธ (REJECTED) ออกจากตารางหลัก
  const activeBookings = bookings.filter(b => 
    b.status !== 'REJECTED' && 
    b.status !== 'CANCELLED' &&
    (selectedRoom === 'ALL' || String(b.room_id) === String(selectedRoom)) &&
    (b.booking_date === selectedDate)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" /> ตารางการใช้งานห้องเรียน/ห้องประชุม
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">แสดงช่วงเวลาการใช้งานจริงที่ได้รับอนุมัติหรือรออนุมัติ (ซ่อนคำขอที่ปฏิเสธ)</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">เลือกวันที่:</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">เลือกห้อง:</label>
            <select 
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">ทุกห้องในระบบ</option>
             
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h4 className="text-base font-bold text-slate-900">ผังเวลาการใช้งานประจำวันที่ {selectedDate}</h4>
            <p className="text-xs text-slate-400">รายการเวลาที่มีการยื่นจองในระบบ</p>
          </div>

          <Link 
            to="/book/1" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm"
          >
            + ยื่นขอจองห้อง
          </Link>
        </div>

        {activeBookings.length === 0 ? (
          <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold">ไม่มีรายการจองในวันที่เลือก</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeBookings.map((b) => (
              <div key={b.id} className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 space-y-3 hover:border-indigo-200 transition shadow-sm">
                
                {/* Header: เวลา + สถานะ */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="inline-flex items-center gap-1.5 bg-indigo-600 text-white font-bold text-xs px-3 py-1 rounded-xl shadow-sm">
                    <Clock className="w-3.5 h-3.5" /> {b.start_time} - {b.end_time} น.
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    b.status === 'APPROVED' || b.status === 'CONFIRMED' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {b.status === 'APPROVED' || b.status === 'CONFIRMED' ? '✓ อนุมัติแล้ว' : '⏳ รอการอนุมัติ'}
                  </span>
                </div>

                {/* รายละเอียดผู้จองแบบชัดเจน */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 text-sm">
                      {b.title ? `${b.title} ${b.user_name}` : b.user_name}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      b.user_type === 'นักศึกษา' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {b.user_type === 'นักศึกษา' ? '🎓 นักศึกษา' : '💼 อาจารย์/บุคลากร'}
                    </span>
                  </div>

                  {b.user_type === 'นักศึกษา' && b.student_id && (
                    <div className="text-slate-600 font-medium">🎓 รหัสนิสิต: <span className="font-bold text-indigo-950">{b.student_id}</span></div>
                  )}
                  <div className="text-slate-600">📧 อีเมล: <span className="text-slate-800">{b.user_email || '-'}</span></div>
                  <div className="text-slate-600">📞 เบอร์โทรศัพท์: <span className="text-slate-800">{b.phone || '-'}</span></div>
                  <div className="text-slate-600">👥 จำนวนผู้เข้าร่วม: <span className="font-bold text-slate-800">{b.attendees_count || 1} คน</span></div>
                  
                  <div className="mt-2 pt-2 border-t border-slate-200/60 bg-white p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5">วัตถุประสงค์:</span>
                    <p className="text-slate-700 font-medium italic">"{b.purpose}"</p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 🔑 2. หน้าแอดมินหลังบ้าน (รูปที่ 2 - การ์ดสถิติกดเลือกดูตารางได้)
// ----------------------------------------------------------------------

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 🎯 สถานะการกรองจากปุ่มการ์ด
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({ name: '', capacity: '', image: '', description: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    fetchBookings().then(res => setBookings(res.data)).catch(() => setBookings([]));
    fetchRooms().then(res => setRooms(res.data)).catch(() => setRooms([]));
    fetchAdmins().then(res => setAdmins(res.data)).catch(() => setAdmins([]));
  };

  const handleImageFileChange = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const approvedCount = bookings.filter(b => b.status === 'APPROVED' || b.status === 'CONFIRMED').length;
  const rejectedCount = bookings.filter(b => b.status === 'REJECTED' || b.status === 'CANCELLED').length;

  // 🎯 กรองตารางการจองตามการ์ดสถิติที่แอดมินกดคลิก
  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'PENDING') return b.status === 'PENDING';
    if (statusFilter === 'APPROVED') return b.status === 'APPROVED' || b.status === 'CONFIRMED';
    if (statusFilter === 'REJECTED') return b.status === 'REJECTED' || b.status === 'CANCELLED';
    return true; // ALL
  });

  const handleStatusChange = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      alert(`อัปเดตสถานะการจองเรียบร้อยแล้ว!`);
      loadData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  // 🗑️ ลบคำขอออกจากระบบเด็ดขาด
  const handleDeleteBooking = async (id) => {
    if (window.confirm('คุณต้องการลบคำขอนี้ออกจากระบบเด็ดขาดใช่หรือไม่?')) {
      try {
        await deleteBooking(id);
        alert('ลบรายการจองสำเร็จ!');
        loadData();
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบรายการ');
      }
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!newRoom.image) {
      alert('กรุณาเลือกรูปภาพห้องพักด้วยครับ');
      return;
    }
    try {
      await addRoom(newRoom);
      alert('เพิ่มห้องใหม่สำเร็จ!');
      setNewRoom({ name: '', capacity: '', image: '', description: '' });
      loadData();
    } catch (err) {
      alert('ไม่สามารถเพิ่มห้องได้');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm('คุณต้องการลบห้องนี้ออกจากระบบใช่หรือไม่?')) {
      try {
        await deleteRoom(id);
        alert('ลบห้องสำเร็จ!');
        loadData();
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบห้อง');
      }
    }
  };

  const handleUpdateRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateRoom(editingRoom.id, editingRoom);
      alert('แก้ไขข้อมูลห้องสำเร็จ!');
      setEditingRoom(null);
      loadData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการแก้ไขห้อง');
    }
  };

  return (
    <div className="space-y-8">
      {/* 📊 การ์ดสถิติ 4 ใบ กดคลิกเปลี่ยนตัวกรองตารางด้านล่างได้ทันที */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-600" /> สรุปภาพรวมระบบ (คลิกการ์ดเพื่อกรองข้อมูล)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: ทั้งหมด */}
          <button 
            onClick={() => setStatusFilter('ALL')}
            className={`p-5 rounded-2xl border text-left transition shadow-sm flex items-center justify-between cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-white border-slate-200/80 hover:border-indigo-200'
            }`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-500">รายการจองทั้งหมด</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{totalBookings} รายการ</h4>
            </div>
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
          </button>

          {/* Card 2: รออนุมัติ */}
          <button 
            onClick={() => setStatusFilter('PENDING')}
            className={`p-5 rounded-2xl border text-left transition shadow-sm flex items-center justify-between cursor-pointer ${
              statusFilter === 'PENDING' ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20' : 'bg-white border-slate-200/80 hover:border-amber-200'
            }`}
          >
            <div>
              <p className="text-xs font-semibold text-amber-600">รอการอนุมัติ</p>
              <h4 className="text-2xl font-black text-amber-600 mt-1">{pendingCount} รายการ</h4>
            </div>
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
              <Clock3 className="w-6 h-6" />
            </div>
          </button>

          {/* Card 3: อนุมัติแล้ว */}
          <button 
            onClick={() => setStatusFilter('APPROVED')}
            className={`p-5 rounded-2xl border text-left transition shadow-sm flex items-center justify-between cursor-pointer ${
              statusFilter === 'APPROVED' ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200/80 hover:border-emerald-200'
            }`}
          >
            <div>
              <p className="text-xs font-semibold text-emerald-600">อนุมัติแล้ว</p>
              <h4 className="text-2xl font-black text-emerald-600 mt-1">{approvedCount} รายการ</h4>
            </div>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
              <CheckSquare className="w-6 h-6" />
            </div>
          </button>

          {/* Card 4: ปฏิเสธ / ยกเลิก */}
          <button 
            onClick={() => setStatusFilter('REJECTED')}
            className={`p-5 rounded-2xl border text-left transition shadow-sm flex items-center justify-between cursor-pointer ${
              statusFilter === 'REJECTED' ? 'bg-red-50/80 border-red-500 ring-2 ring-red-500/20' : 'bg-white border-slate-200/80 hover:border-red-200'
            }`}
          >
            <div>
              <p className="text-xs font-semibold text-red-500">ปฏิเสธ / ยกเลิก</p>
              <h4 className="text-2xl font-black text-red-500 mt-1">{rejectedCount} รายการ</h4>
            </div>
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center font-bold">
              <XCircle className="w-6 h-6" />
            </div>
          </button>

        </div>
      </div>

      {/* 🛡️ ตารางแสดงรายชื่อผู้เข้าใช้งาน Admin (แบ่งฟิลด์ นิสิต vs อาจารย์) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-indigo-600" /> รายชื่อผู้มีสิทธิ์ / ผู้เข้าใช้งานหลังบ้าน (Admin)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <th className="p-3">ชื่อ - นามสกุล</th>
                <th className="p-3">อีเมล</th>
                <th className="p-3">เบอร์โทรศัพท์</th>
                <th className="p-3">ข้อมูลเพิ่มเติม</th>
                <th className="p-3 text-center">ประเภทผู้ใช้งาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-slate-400">ยังไม่มีประวัติการเข้าใช้งาน Admin จากผู้ใช้จริง</td>
                </tr>
              ) : (
                admins.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-800">
                      {adm.title ? `${adm.title} ${adm.name}` : adm.name}
                    </td>
                    <td className="p-3 text-slate-600">{adm.email || '-'}</td>
                    <td className="p-3 text-slate-600">{adm.phone || '-'}</td>
                    <td className="p-3">
                      {adm.user_type === 'นักศึกษา' && adm.student_id ? (
                        <span className="text-indigo-600 font-bold">🎓 รหัสนิสิต: {adm.student_id}</span>
                      ) : (
                        <span className="text-slate-400 italic">- (บุคลากร/อาจารย์)</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-bold px-2.5 py-1 rounded-lg text-[11px] ${
                        adm.user_type === 'นักศึกษา' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {adm.user_type === 'นักศึกษา' ? '🎓 นักศึกษา' : '💼 บุคลากร / อาจารย์'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ตารางรายการจองห้อง (กรองตามการ์ดที่กด + มีปุ่มลบทิ้ง) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-indigo-600" /> อนุมัติและจัดการรายการจอง
          </h3>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-bold">
            แสดงผล: {statusFilter === 'ALL' ? 'ทั้งหมด' : statusFilter === 'PENDING' ? 'รอการอนุมัติ' : statusFilter === 'APPROVED' ? 'อนุมัติแล้ว' : 'ปฏิเสธ / ยกเลิก'} ({filteredBookings.length} รายการ)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <th className="p-3">วันที่ / เวลา</th>
                <th className="p-3">ห้อง</th>
                <th className="p-3">ผู้จอง</th>
                <th className="p-3">วัตถุประสงค์</th>
                <th className="p-3">สถานะปัจจุบัน</th>
                <th className="p-3 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-400">ไม่พบรายการจองในหมวดหมู่นี้</td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-medium">
                      <div>{b.booking_date}</div>
                      <div className="text-[10px] text-indigo-600 font-bold mt-0.5">{b.start_time} - {b.end_time} น.</div>
                    </td>
                    <td className="p-3 font-bold text-slate-800">{b.room_name}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">
                        {b.title ? `${b.title} ${b.user_name}` : b.user_name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">📧 {b.user_email || '-'}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">📞 {b.phone || '-'}</div>
                      {b.user_type === 'นักศึกษา' && b.student_id && (
                        <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">🎓 รหัสนิสิต: {b.student_id}</div>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs">{b.purpose}</td>
                    <td className="p-3">
                      {b.status === 'APPROVED' || b.status === 'CONFIRMED' ? (
                        <span className="bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[10px]">✓ อนุมัติแล้ว</span>
                      ) : b.status === 'REJECTED' ? (
                        <span className="bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full text-[10px]">✕ ปฏิเสธ</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-full text-[10px]">⏳ รออนุมัติ</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleStatusChange(b.id, 'APPROVED')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition">อนุมัติ</button>
                        <button onClick={() => handleStatusChange(b.id, 'REJECTED')} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition">ปฏิเสธ</button>
                        <button onClick={() => handleDeleteBooking(b.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 rounded-lg text-[10px] transition flex items-center gap-1" title="ลบออกจากระบบ">
                          <Trash2 className="w-3 h-3" /> ลบทิ้ง
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" /> จัดการและแก้ไขห้องในระบบ
          </h3>

          <div className="space-y-3">
            {rooms.map((r) => (
              <div key={r.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img src={r.image} alt={r.name} className="w-full h-full object-cover object-center" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{r.name}</h4>
                    <p className="text-[11px] text-slate-500">ความจุ: {r.capacity} คน</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingRoom(r)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteRoom(r.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">➕ เพิ่มห้องใหม่</h3>
          <form onSubmit={handleAddRoom} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ชื่อห้อง</label>
              <input placeholder=" " value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-xl" required />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ความจุ (คน)</label>
              <input type="number" placeholder=" " value={newRoom.capacity} onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-xl" required />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">เลือกรูปภาพห้อง (จากโฟลเดอร์)</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageFileChange(e, (base64) => setNewRoom({ ...newRoom, image: base64 }))} className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50 cursor-pointer" />
              {newRoom.image && (
                <div className="mt-2.5 relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={newRoom.image} alt="Preview" className="w-full h-full object-cover object-center" />
                </div>
              )}
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">รายละเอียดห้อง</label>
              <textarea placeholder="รายละเอียดอุปกรณ์..." value={newRoom.description} onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-xl" rows="2" required></textarea>
            </div>
            <button className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition">บันทึกห้องใหม่</button>
          </form>
        </div>
      </div>

      {editingRoom && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900">✏️ แก้ไขข้อมูลห้องพัก</h4>
              <button onClick={() => setEditingRoom(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleUpdateRoomSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อห้อง</label>
                <input value={editingRoom.name} onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })} className="w-full border p-2.5 rounded-xl" required />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ความจุ (คน)</label>
                <input type="number" value={editingRoom.capacity} onChange={(e) => setEditingRoom({ ...editingRoom, capacity: e.target.value })} className="w-full border p-2.5 rounded-xl" required />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">เปลี่ยนรูปภาพห้อง</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageFileChange(e, (base64) => setEditingRoom({ ...editingRoom, image: base64 }))} className="w-full border border-slate-200 p-2 rounded-xl text-xs bg-slate-50 cursor-pointer" />
                {editingRoom.image && (
                  <div className="mt-2.5 relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={editingRoom.image} alt="Preview" className="w-full h-full object-cover object-center" />
                  </div>
                )}
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">รายละเอียด</label>
                <textarea value={editingRoom.description} onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })} className="w-full border p-2.5 rounded-xl" rows="3" required></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingRoom(null)} className="w-1/2 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl">ยกเลิก</button>
                <button type="submit" className="w-1/2 bg-indigo-600 text-white font-bold py-2.5 rounded-xl">บันทึกการแก้ไข</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 🖼️ 3. หน้าแสดงรายการห้อง
// ----------------------------------------------------------------------

function RoomListPage({ user }) {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRooms().then(res => setRooms(res.data)).catch(() => setRooms([]));
  }, []);

  const handleBookClick = (e) => {
    if (user?.role === 'ADMIN') {
      e.preventDefault();
      alert('⚠️ คุณอยู่ในโหมดผู้ดูแลระบบ (Admin) ไม่สามารถทำการจองห้องได้ กรุณากดสลับเป็นโหมด User ก่อนครับ');
    }
  };

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" /> รายการห้องที่มีให้จอง
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">เลือกห้องที่ต้องการดูรายละเอียดและทำการจอง</p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อห้อง หรือ อุปกรณ์..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
            
            {/* ส่วนรูปภาพที่กดจองได้ */}
            <Link 
              to={user ? `/book/${room.id}` : '/login'}
              onClick={handleBookClick}
              className="block relative h-48 w-full overflow-hidden bg-slate-100 cursor-pointer hover:opacity-90 transition"
            >
              <img src={room.image} alt={room.name} className="w-full h-full object-cover object-center" />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full">
                {room.number || `ห้อง ${room.id}`}
              </div>
              <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                พร้อมใช้งาน
              </div>
            </Link>

            {/* รายละเอียดห้องพัก */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold text-indigo-600 mb-1">
                  {room.location || 'อาคารเรียนรวม 3'} • 👥 ได้ {room.capacity} คน
                </div>
                <h4 className="text-base font-bold text-slate-900 leading-snug">{room.name}</h4>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {room.description}
                </p>
              </div>

              {/* ปุ่มกดจองห้อง */}
              <Link
                to={user ? `/book/${room.id}` : '/login'}
                onClick={handleBookClick}
                className="mt-5 w-full block text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs py-2.5 rounded-xl transition"
              >
                {user ? (user.role === 'ADMIN' ? 'โหมด Admin (สลับโหมดเพื่อจอง)' : 'จองห้องนี้') : 'เข้าสู่ระบบเพื่อจอง'}
              </Link>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 📝 4. หน้าฟอร์มการจองห้อง
// ----------------------------------------------------------------------

function BookingPage({ user }) {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [form, setForm] = useState({
    booking_date: '2026-10-27',
    start_time: '09:00',
    end_time: '11:00',
    attendees_count: 5,
    purpose: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms().then(res => {
      const found = res.data.find(r => String(r.id) === String(roomId));
      if (found) setRoom(found);
    }).catch(() => {});
  }, [roomId]);

  if (user?.role === 'ADMIN') {
    return (
      <div className="max-w-md mx-auto bg-amber-50/90 border border-amber-200 rounded-2xl p-8 text-center space-y-4 my-10 shadow-sm">
        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-amber-900">ไม่สามารถจองห้องในโหมด Admin ได้</h3>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            คุณกำลังใช้งานในสิทธิ์ผู้ดูแลระบบ (Admin) กรุณากดปุ่ม <strong className="bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-900 font-bold">"กลับเป็น User"</strong> ที่มุมขวาบนก่อนทำการจองห้องพักครับ
          </p>
        </div>
        <Link 
          to="/" 
          className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md"
        >
          กลับไปหน้าหลัก
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBooking({ ...form, room_id: roomId });
      alert('ส่งคำขอจองห้องสำเร็จ! รอการอนุมัติจากแอดมิน');
      navigate('/my-bookings');
    } catch (err) {
      alert(err.response?.data?.message || 'ส่งคำขอจองห้องเรียบร้อยแล้ว');
      if (err.response?.status !== 409) navigate('/my-bookings');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80 my-6 space-y-6">
      <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0">
          {roomId}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{room?.name || `ฟอร์มจองห้องประชุม ${roomId}`}</h3>
          <p className="text-xs text-slate-500 mt-0.5">กรอกข้อมูลวันที่ เวลา และวัตถุประสงค์เพื่อยื่นคำขอจองห้อง</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">วันที่ต้องการจอง</label>
          <input 
            type="date" 
            value={form.booking_date}
            onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">เวลาเริ่มต้น</label>
            <input 
              type="time" 
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">เวลาสิ้นสุด</label>
            <input 
              type="time" 
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">จำนวนผู้เข้าร่วม (คน)</label>
          <input 
            type="number" 
            min="1"
            max={room?.capacity || 100}
            placeholder="เช่น 10"
            value={form.attendees_count}
            onChange={(e) => setForm({ ...form, attendees_count: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          {room?.capacity && (
            <p className="text-[10px] text-slate-400 mt-1">*ความจุสูงสุดของห้องนี้คือ {room.capacity} คน</p>
          )}
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">วัตถุประสงค์ / หมายเหตุการจอง</label>
          <textarea 
            rows="3" 
            placeholder="ระบุเหตุผลในการใช้งาน..."
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          ></textarea>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500">ข้อมูลผู้ยื่นคำขอ:</div>
          <div className="text-xs font-bold text-slate-800">
            {user?.title ? `${user.title} ${user.name}` : user?.name} ({user?.user_type || 'นักศึกษา'})
          </div>
          {user?.user_type === 'นักศึกษา' && user?.student_id && (
            <div className="text-[11px] text-slate-600 font-medium">🎓 รหัสนิสิต: <span className="text-slate-800">{user.student_id}</span></div>
          )}
          <div className="text-[11px] text-slate-600 font-medium">📧 อีเมล: <span className="text-slate-800">{user?.email}</span></div>
          <div className="text-[11px] text-slate-600 font-medium">📞 เบอร์โทรศัพท์: <span className="text-slate-800">{user?.phone}</span></div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 mt-2"
        >
          <Send className="w-4 h-4" /> ยืนยันส่งคำขอจองห้อง
        </button>
      </form>
    </div>
  );
}

// ----------------------------------------------------------------------
// 👤 5. หน้าประวัติการจองของฉัน
// ----------------------------------------------------------------------

function MyBookingsPage({ user }) {
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchBookings()
        .then((res) => {
          const data = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
          const filtered = data.filter(
            (b) => String(b?.user_id) === String(user?.id) || (b?.user_email && b?.user_email === user?.email)
          );
          setMyBookings(filtered);
        })
        .catch(() => setMyBookings([]))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-2xl">👤</span>
        <div>
          <h3 className="text-xl font-bold text-slate-900">รายการจองห้องของฉัน</h3>
          <p className="text-xs text-slate-500">
            ประวัติและสถานะการจองห้องเรียน/ประชุมเฉพาะบัญชีของคุณ ({user?.title ? `${user.title} ${user.name}` : user?.name || ''})
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-medium text-xs">
          กำลังโหลดรายการจองของคุณ...
        </div>
      ) : myBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            📅
          </div>
          <h4 className="text-lg font-bold text-slate-800">ยังไม่มีรายการจองห้องของคุณ</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            คุณยังไม่ได้ทำการจองห้องใดๆ สามารถเลือกดูห้องพักและกดจองได้ทันที
          </p>
          <Link
            to="/"
            className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition"
          >
            ไปที่หน้าเลือกห้องจอง
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myBookings.map((b) => (
            <div key={b?.id || Math.random()} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{b?.room_name || `ห้องจอง #${b?.id}`}</h4>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                    📅 {b?.booking_date} | ⏰ {b?.start_time} - {b?.end_time} น.
                  </p>
                </div>
                <div>
                  {b?.status === 'APPROVED' || b?.status === 'CONFIRMED' ? (
                    <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full text-[10px]">✓ อนุมัติแล้ว</span>
                  ) : b?.status === 'REJECTED' ? (
                    <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-[10px]">✕ ปฏิเสธ</span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-[10px]">⏳ รออนุมัติ</span>
                  )}
                </div>
              </div>

              <div className="text-xs space-y-1 text-slate-600">
                <div>👥 จำนวนผู้เข้าร่วม: <span className="font-semibold text-slate-800">{b?.attendees_count || 1} คน</span></div>
                <div className="mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">วัตถุประสงค์:</span>
                  <span className="font-medium text-slate-800 italic">"{b?.purpose || '-'}"</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 🔑 6. หน้าลงทะเบียนผู้ใช้งาน
// ----------------------------------------------------------------------

function RegisterPage() {
  const [form, setForm] = useState({ 
    title: 'นาย',
    name: '', 
    student_id: '',
    phone: '', 
    email: '', 
    password: '', 
    user_type: 'นักศึกษา' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.user_type === 'นักศึกษา' && !form.student_id.trim()) {
      alert('กรุณากรอกรหัสนิสิตด้วยครับ');
      return;
    }

    try {
      await registerUser(form);
      alert('ลงทะเบียนสำเร็จ!');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'สมัครไม่สำเร็จ');
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80 my-8">
      <h3 className="text-2xl font-bold text-slate-900 text-center mb-6">ลงทะเบียนผู้ใช้งาน</h3>
      <form onSubmit={handleRegister} className="space-y-4">
        
        <div className="flex gap-2">
          <div className="w-1/3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">คำนำหน้า</label>
            <select 
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
              <option value="ดร.">ดร.</option>
              <option value="ผศ.">ผศ.</option>
              <option value="รศ.">รศ.</option>
              <option value="ศ.">ศ.</option>
            </select>
          </div>
          <div className="w-2/3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล</label>
            <input 
              type="text" 
              placeholder=" " 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะผู้ใช้งาน</label>
          <select 
            value={form.user_type} 
            onChange={(e) => setForm({ ...form, user_type: e.target.value, student_id: '' })} 
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="นักศึกษา">🎓 นักศึกษา</option>
            <option value="บุคลากร">💼 บุคลากร / อาจารย์</option>
          </select>
        </div>

        {form.user_type === 'นักศึกษา' && (
          <div className="animate-in fade-in duration-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รหัสนิสิต <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder=" " 
              value={form.student_id} 
              onChange={(e) => setForm({ ...form, student_id: e.target.value })} 
              className="w-full border border-indigo-200 bg-indigo-50/30 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium" 
              required 
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
          <input 
            type="text" 
            placeholder=" " 
            value={form.phone} 
            onChange={(e) => setForm({ ...form, phone: e.target.value })} 
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            required 
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมล</label>
          <input 
            type="email" 
            placeholder=" " 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
            required 
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่าน</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="รหัสผ่าน" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs pr-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-md mt-2">
          สมัครสมาชิก
        </button>
      </form>
    </div>
  );
}

// ----------------------------------------------------------------------
// 🔑 7. หน้าเข้าสู่ระบบ
// ----------------------------------------------------------------------

function LoginPage({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('savedUser', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate(res.data.user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      alert(err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80 my-8">
      <h3 className="text-2xl font-bold text-slate-900 text-center mb-6">เข้าสู่ระบบ</h3>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมล</label>
          <input type="email" placeholder="อีเมลของคุณ" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่าน</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="รหัสผ่าน" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs pr-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-md mt-2">เข้าสู่ระบบ</button>
      </form>
      <p className="mt-6 text-center text-xs text-slate-500">
        ยังไม่มีบัญชี? <Link to="/register" className="text-indigo-600 font-bold hover:underline">ลงทะเบียนที่นี่</Link>
      </p>
    </div>
  );
}

// ----------------------------------------------------------------------
// 🗺️ 8. หน้าแผนที่อาคารและข้อมูลติดต่อ (Map Page)
// ----------------------------------------------------------------------

function MapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          🗺️ แผนที่และข้อมูลการเดินทาง
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ⬅️ ฝั่งซ้าย: ข้อมูลรายละเอียด/ที่อยู่/เบอร์ติดต่อ */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <span className="bg-indigo-100 text-indigo-700 font-bold text-[11px] px-3 py-1 rounded-full">
              📍 ที่ตั้งอาคาร
            </span>
            <h4 className="text-lg font-bold text-slate-900 mt-2">อาคาร ธรรมราชา 3 Zone B ชั้น2</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              มหาวิทยาลัยนเรศวร ตำบลท่าโพธิ์ อำเภอเมืองพิษณุโลก จังหวัดพิษณุโลก 65000
            </p>
          </div>

          {/* รายละเอียดจุดสังเกตและการเดินทาง */}
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 font-bold">
                🏢
              </div>
              <div>
                <span className="font-bold text-slate-800 block">ตำแหน่งห้องในอาคาร</span>
                <span className="text-slate-500">ห้อง 301 - 303 อยู่บริเวณชั้น 2</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 font-bold">
                📞
              </div>
              <div>
                <span className="font-bold text-slate-800 block">เบอร์โทรศัพท์ติดต่อ</span>
                <span className="text-slate-500">080 555 5555</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 font-bold">
                📧
              </div>
              <div>
                <span className="font-bold text-slate-800 block">อีเมลสำหรับสอบถาม</span>
                <span className="text-slate-500">Test@nu.ac.th</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0 font-bold">
                ⏰
              </div>
              <div>
                <span className="font-bold text-slate-800 block">เวลาทำการอาคาร</span>
                <span className="text-slate-500">วันจันทร์ - วันศุกร์: 08:30 - 16:30 น.</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">💡 หมายเหตุการเข้าใช้งาน:</div>
            <p>• กรุณานำบัตรนิสิต/บัตรบุคลากรมาติดต่อรับกุญแจห้องก่อนเวลาจอง 15 นาที</p>
            <p>• หากต้องการใช้อุปกรณ์เพิ่มเติม โปรดระบุในหมายเหตุการจอง</p>
          </div>
          <img src={buildingImg} alt="รูปอาคาร" className="w-full h-auto rounded-lg" />
        </div>

        {/* ➡️ ฝั่งขวา: แผนที่ Google Maps */}
        <div className="lg:col-span-7 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden h-[480px]">
          <iframe
            title="Building Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d339.8794466662927!2d100.19223972663251!3d16.7419777136431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30dfbea2b8305c89%3A0x29b0f7776a73ea7a!2z4Lia4Lix4LiT4LiR4Li04LiV4Lin4Li04LiX4Lii4Liy4Lil4Lix4LiiIOC4oeC4q-C4suC4p-C4tOC4l-C4ouC4suC4peC4seC4ouC4meC5gOC4o-C4qOC4p-C4ow!5e0!3m2!1sth!2sth!4v1793036068364!5m2!1sth!2sth"
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: '1rem' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}