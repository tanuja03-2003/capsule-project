const db = require('../config/database');

const createPayment = async ({
    bookingId,
    amount
}) => {

    const transactionId = 'TXN-' + Date.now();

    const [result] = await db.execute(
        `INSERT INTO payments
        (booking_id, amount, payment_status, transaction_id)
        VALUES (?, ?, 'SUCCESS', ?)`,
        [
            bookingId,
            amount,
            transactionId
        ]
    );

    return {
        id: result.insertId,
        bookingId,
        amount,
        paymentStatus: 'SUCCESS',
        transactionId
    };
};

module.exports = {
    createPayment
};