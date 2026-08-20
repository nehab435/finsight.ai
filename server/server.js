const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection (Fixed for Mongoose v8+)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✓ Connected to MongoDB successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// ==========================================
// ROUTES
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'FinSight Server is healthy and running!' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/document'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/accounts', require('./routes/account'));
app.use('/api/insights', require('./routes/insights'));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ FinSight Server is running on http://localhost:${PORT}`);
});