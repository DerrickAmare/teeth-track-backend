const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['https://teethtracks.com', 'https://www.teethtracks.com', 'http://localhost:8080'],
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// MongoDB Connection with better error handling
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('Connection string:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
  });

// Demo Request Schema
const demoRequestSchema = new mongoose.Schema({
  practiceName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const DemoRequest = mongoose.model('DemoRequest', demoRequestSchema);

// API Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin.html'));
});

app.post('/api/demo-request', async (req, res) => {
  try {
    console.log('Received demo request:', req.body);
    const { practiceName, email, phoneNumber, message } = req.body;
    
    const demoRequest = new DemoRequest({
      practiceName,
      email,
      phoneNumber,
      message
    });

    await demoRequest.save();
    console.log('Demo request saved successfully');
    res.status(201).json({ message: 'Demo request submitted successfully' });
  } catch (error) {
    console.error('Error saving demo request:', error);
    res.status(500).json({ error: 'Failed to submit demo request', details: error.message });
  }
});

app.get('/api/demo-requests', async (req, res) => {
  try {
    console.log('Fetching demo requests...');
    const requests = await DemoRequest.find().sort({ createdAt: -1 });
    console.log(`Found ${requests.length} demo requests`);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching demo requests:', error);
    res.status(500).json({ error: 'Failed to fetch demo requests', details: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the website at http://localhost:${PORT}`);
  console.log(`Access the admin panel at http://localhost:${PORT}/admin`);
}); 