const notificationService = require('../services/notificationService');

const sendNotification = async (req, res) => {
    try {
        const { email, message } = req.body;

        if (!email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Email and message are required'
            });
        }

        const result = await notificationService.sendNotification({
            email,
            message
        });

        return res.status(200).json({
            success: true,
            message: 'Notification sent successfully',
            notification: result
        });

    } catch (error) {
        console.error('Notification Controller Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to send notification'
        });
    }
};

module.exports = {
    sendNotification
};