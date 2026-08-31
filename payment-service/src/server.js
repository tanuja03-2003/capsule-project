require('dotenv').config();

const express = require('express');
const cors = require('cors');

const paymentRoutes =
    require('./routes/paymentRoutes');

const registerService =
    require('./serviceRegistry');

const app = express();

app.use(cors());

app.use(express.json());


// Health check
app.get('/health', (req, res) => {

    res.json({
        success: true,
        message: 'Payment Microservice is running'
    });

});


// Payment routes
app.use('/api', paymentRoutes);


// Start server
const PORT = process.env.PORT || 3002;

app.listen(PORT, async () => {

    console.log(
        `Payment Microservice listening on port ${PORT}`
    );

    // Automatically register with Service Registry
    await registerService();

});