import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { plots as initialPlots } from './plotsData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3043;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const PLOTS_FILE    = path.join(DATA_DIR, 'plots.json');
const ADMIN_FILE    = path.join(DATA_DIR, 'admin.json');

const DEFAULT_ADMIN = {
  email: 'admin@gmail.com',
  password: 'admin123',
  securityCode: '2026',
  token: 'ADMIN_TOKEN_PLOT_BOOKING_2026'
};

if (!fs.existsSync(ADMIN_FILE)) {
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(DEFAULT_ADMIN, null, 2));
}
let adminCreds = DEFAULT_ADMIN;
try { adminCreds = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8')); }
catch { adminCreds = DEFAULT_ADMIN; }

let plots    = [];
let bookings = [];

if (fs.existsSync(PLOTS_FILE)) {
  try { plots = JSON.parse(fs.readFileSync(PLOTS_FILE, 'utf8')); }
  catch { plots = [...initialPlots]; fs.writeFileSync(PLOTS_FILE, JSON.stringify(plots, null, 2)); }
} else {
  plots = [...initialPlots];
  fs.writeFileSync(PLOTS_FILE, JSON.stringify(plots, null, 2));
}

if (fs.existsSync(BOOKINGS_FILE)) {
  try { bookings = JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8')); }
  catch { bookings = []; fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2)); }
} else {
  bookings = [];
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

const saveDatabase = () => {
  fs.writeFileSync(PLOTS_FILE,    JSON.stringify(plots,    null, 2));
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
};

const isAdmin = (req) => req.headers.authorization === `Bearer ${adminCreds.token}`;

app.get('/api/plots', (_req, res) => {
  res.json(plots.map(({ bookingDetails, ...pub }) => pub));
});

app.post('/api/plots/book', (req, res) => {
  const { plotId, name, phone, email, gender, address, notes, paymentMethod, screenshot, transactionId, idProof, federation, leader, leaderPhone, amount } = req.body;
  if (!plotId || !name || !phone || !email || !screenshot || !transactionId || !idProof) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  const plotIndex = plots.findIndex(p => p.id === plotId.toString());
  if (plotIndex === -1) return res.status(404).json({ success: false, message: 'Plot not found' });
  const plot = plots[plotIndex];
  if (plot.status !== 'available') {
    return res.status(400).json({ success: false, message: 'Plot is not available for booking' });
  }
  const bookingId = 'BK_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const newBooking = {
    id: bookingId, plotId: plot.id, block: plot.block, dimensions: plot.dimensions,
    area: plot.area, customerName: name, customerPhone: phone, customerEmail: email,
    customerGender: gender || '', customerAddress: address || '', notes: notes || '',
    federation: federation || '', leader: leader || '',
    leaderPhone: leaderPhone || '', amount: amount || '',
    paymentMethod: paymentMethod || 'Cash', screenshot, transactionId, idProof,
    status: 'pending', bookedAt: new Date().toISOString()
  };
  plots[plotIndex].status = 'pending';
  plots[plotIndex].bookingDetails = { bookingId, customerName: name, bookedAt: newBooking.bookedAt };
  bookings.push(newBooking);
  saveDatabase();
  res.json({ success: true, booking: newBooking });
});

app.post('/api/admin/login', (req, res) => {
  const { email, password, securityCode } = req.body;
  if (email === adminCreds.email && password === adminCreds.password && securityCode === adminCreds.securityCode) {
    res.json({ success: true, token: adminCreds.token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials or security code' });
  }
});

app.get('/api/admin/bookings', (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  res.json({ bookings, plots });
});

app.post('/api/admin/bookings/approve', (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { bookingId } = req.body;
  const bi = bookings.findIndex(b => b.id === bookingId);
  if (bi === -1) return res.status(404).json({ success: false, message: 'Booking not found' });
  bookings[bi].status = 'accepted';
  bookings[bi].approvedAt = new Date().toISOString();
  const pi = plots.findIndex(p => p.id === bookings[bi].plotId);
  if (pi !== -1) {
    plots[pi].status = 'booked';
    plots[pi].bookingDetails = { bookingId, customerName: bookings[bi].customerName, bookedAt: bookings[bi].bookedAt, approvedAt: bookings[bi].approvedAt };
  }
  saveDatabase();
  res.json({ success: true, booking: bookings[bi] });
});

app.post('/api/admin/bookings/reject', (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { bookingId } = req.body;
  const bi = bookings.findIndex(b => b.id === bookingId);
  if (bi === -1) return res.status(404).json({ success: false, message: 'Booking not found' });
  bookings[bi].status = 'rejected';
  bookings[bi].rejectedAt = new Date().toISOString();
  const pi = plots.findIndex(p => p.id === bookings[bi].plotId);
  if (pi !== -1) { plots[pi].status = 'available'; plots[pi].bookingDetails = null; }
  saveDatabase();
  res.json({ success: true, booking: bookings[bi] });
});

app.post('/api/admin/plots/update-status', (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { plotId, status, notes } = req.body;
  if (!plotId || !['available', 'booked', 'blocked'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid plotId or status' });
  }
  const pi = plots.findIndex(p => p.id === plotId.toString());
  if (pi === -1) return res.status(404).json({ success: false, message: 'Plot not found' });
  if (plots[pi].status === 'booked' && status !== 'booked') {
    const bid = plots[pi].bookingDetails?.bookingId;
    bookings = bookings.filter(b => b.id !== bid);
    plots[pi].bookingDetails = null;
  }
  if (status === 'blocked') plots[pi].bookingDetails = { notes: notes || 'Blocked by Admin' };
  if (status === 'available') plots[pi].bookingDetails = null;
  plots[pi].status = status;
  saveDatabase();
  res.json({ success: true, plot: plots[pi] });
});

app.post('/api/admin/bookings/delete', (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { bookingId } = req.body;
  const bi = bookings.findIndex(b => b.id === bookingId);
  if (bi === -1) return res.status(404).json({ success: false, message: 'Booking not found' });
  const pi = plots.findIndex(p => p.id === bookings[bi].plotId);
  if (pi !== -1) { plots[pi].status = 'available'; plots[pi].bookingDetails = null; }
  bookings.splice(bi, 1);
  saveDatabase();
  res.json({ success: true, message: 'Booking deleted' });
});

if (fs.existsSync(DIST_DIR)) {
  app.get('*', (_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
