const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://teethtracks.com',
    'https://www.teethtracks.com',
    'http://localhost:8080',
    'https://67d449e347c59c1ec46966fc--gregarious-manatee-622d89.netlify.app'
  ],
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Demo Request Schema
const demoRequestSchema = new mongoose.Schema({
  practiceName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const DemoRequest = mongoose.model('DemoRequest', demoRequestSchema);

// API Routes
app.get('/', (req, res) => {
  res.json({
    status: 'TeethTrack API is running',
    version: '1.0.0',
    endpoints: {
      root: '/ - This help message',
      submitDemo: 'POST /api/demo-request - Submit a demo request',
      getDemos: 'GET /api/demo-requests - Get all demo requests'
    },
    note: 'This is an API server only. For the website, please visit https://teethtracks.com'
  });
});

// Submit Demo Request
app.post('/api/demo-request', async (req, res) => {
  try {
    const demoRequest = new DemoRequest(req.body);
    await demoRequest.save();
    console.log('Demo request saved:', demoRequest);
    res.status(201).json({
      success: true,
      message: 'Demo request submitted successfully',
      data: demoRequest
    });
  } catch (error) {
    console.error('Error saving demo request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit demo request',
      error: error.message
    });
  }
});

// Get All Demo Requests
app.get('/api/demo-requests', async (req, res) => {
  try {
    const requests = await DemoRequest.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching demo requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch demo requests',
      error: error.message
    });
  }
});

// Handle 404 - API endpoint not found
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found',
    note: 'This is an API server. For the website, please visit https://teethtracks.com'
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`TeethTrack API server running on port ${PORT}`);
  console.log('This is an API-only server');
  console.log('For the website, visit: https://teethtracks.com');
}); 