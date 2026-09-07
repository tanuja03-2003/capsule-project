const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3002';

async function createPayment(bookingId, amount) {

    console.log('Calling Payment Microservice...');

    console.log(
        `URL: ${PAYMENT_SERVICE_URL}/api/payments`
    );

    console.log(`Booking ID: ${bookingId}`);
    console.log(`Amount: ${amount}`);

    const response = await fetch(
        `${PAYMENT_SERVICE_URL}/api/payments`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                bookingId,
                amount
            })
        }
    );

    const data = await response.json();

    console.log(
        'Response received from Payment Microservice:',
        data
    );

    if (!response.ok) {
        throw new Error(
            data.message || 'Payment failed'
        );
    }

    return {
        status: response.status,
        data
    };
}

module.exports = {
    createPayment
};