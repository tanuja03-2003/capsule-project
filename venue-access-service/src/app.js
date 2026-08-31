const express = require('express');
const cors = require('cors');

const accessRoutes = require('./routes/accessRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Venue Access Service is running'
    });
});

app.use('/api/access', accessRoutes);

module.exports = app;