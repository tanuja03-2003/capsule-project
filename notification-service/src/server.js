const express = require('express');
const cors = require('cors');

const notificationRoutes =
    require('./routes/notificationRoutes');

const registerService =
    require('./serviceRegistry');

const app = express();

app.use(cors());
app.use(express.json());


// Health check
app.get('/health', (req, res) => {

    res.json({
        success: true,
        message: 'Notification Microservice is running'
    });

});


// Notification routes
app.use('/api', notificationRoutes);


// Start server
const PORT = process.env.PORT || 3003;

app.listen(PORT, async () => {

    console.log(
        `Notification Microservice listening on port ${PORT}`
    );

    // Automatically register with Service Registry
    await registerService();

});