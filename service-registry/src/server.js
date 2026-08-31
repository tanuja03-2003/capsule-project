const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const services = {};

// Register a service
app.post('/register', (req, res) => {

    const { serviceName, host, port } = req.body;

    if (!serviceName || !host || !port) {
        return res.status(400).json({
            success: false,
            message: 'serviceName, host and port are required'
        });
    }

    services[serviceName] = {
        host,
        port,
        url: `http://${host}:${port}`,
        registeredAt: new Date()
    };

    console.log(
        `Service registered: ${serviceName} -> http://${host}:${port}`
    );

    return res.status(201).json({
        success: true,
        message: 'Service registered successfully',
        service: services[serviceName]
    });
});

// Discover a service
app.get('/discover/:serviceName', (req, res) => {

    const serviceName = req.params.serviceName;

    const service = services[serviceName];

    if (!service) {
        return res.status(404).json({
            success: false,
            message: `Service '${serviceName}' not found`
        });
    }

    return res.json({
        success: true,
        service
    });
});

// View all registered services
app.get('/services', (req, res) => {

    return res.json({
        success: true,
        services
    });
});

// Health check
app.get('/health', (req, res) => {

    res.json({
        success: true,
        message: 'Service Registry is running'
    });

});

const PORT = 3005;

app.listen(PORT, () => {

    console.log(
        `Service Registry listening on port ${PORT}`
    );

});