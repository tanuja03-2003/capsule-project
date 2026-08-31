const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:5501',
        'http://127.0.0.1:5501'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'EventHub backend is running'
    });
});

// API routes
app.use('/api', apiRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;