require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/authRoutes'); // use router with /me endpoint
const photoRoutes = require('./routes/photoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const faceRoutes = require('./routes/faceRoutes');
const albumRoutes = require('./routes/albumRoutes');
app.use('/api/albums', albumRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/face', faceRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

// Start server only after DB connection succeeds
const startServer = (port) => {
  const server = app.listen(port, () => console.log(`Server running on port ${port}`));
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying next port...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

(async () => {
  try {
    await connectDB(); // Establish MongoDB connection first
    const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    startServer(PORT);
  } catch (err) {
    console.error('Application startup failed:', err.message);
    process.exit(1);
  }
})();
