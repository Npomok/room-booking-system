import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const adminLogin = (password, userId) => API.post('/auth/admin-login', { password, userId });
export const fetchAdmins = () => API.get('/auth/admins');
export const fetchRooms = () => API.get('/rooms');
export const addRoom = (data) => API.post('/rooms', data);
export const updateRoom = (id, data) => API.put(`/rooms/${id}`, data);
export const deleteRoom = (id) => API.delete(`/rooms/${id}`);
export const fetchBookings = () => API.get('/bookings');
export const createBooking = (data) => API.post('/bookings', data);
export const updateBookingStatus = (id, status) => API.put(`/bookings/${id}/status`, { status });
export const deleteBooking = (id) => API.delete(`/bookings/${id}`); // 🗑️ เพิ่มบรรทัดนี้