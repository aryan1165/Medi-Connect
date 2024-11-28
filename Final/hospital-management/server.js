const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.js');
const patientRoutes = require('./routes/pateint.js'); // Assuming typo in 'patient.js' filename

const dashboardRoutes = require('./routes/dashboard.js'); // New dashboard route

// Initialize app
const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospitalDB';

// Middleware
app.use(cors({ origin: 'http://127.0.0.1:5500' })); // Update to match frontend URL if necessary
app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "utils", "uploads")));

// Connect to MongoDB with improved error handling
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/dashboard', dashboardRoutes); // New dashboard route
// Routes for doctor and nurse


// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
