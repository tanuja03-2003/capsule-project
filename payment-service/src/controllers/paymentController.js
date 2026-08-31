const paymentService = require('../services/paymentService');

const createPayment = async (req, res) => {

    try {

        const {
            bookingId,
            amount
        } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'bookingId and amount are required'
            });
        }

        const payment =
            await paymentService.createPayment({
                bookingId,
                amount
            });

        return res.status(201).json({
            success: true,
            message: 'Payment successful',
            payment
        });

    } catch (error) {

        console.error(
            'Payment Service Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Payment failed'
        });
    }
};

module.exports = {
    createPayment
};