const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize Firebase Admin
const initFirebase = require('./config/firebase');
initFirebase();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://agri-smart-virid.vercel.app' : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health',(req,res)=>{
    res.json({status:'ok'});
})
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

module.exports = app;
