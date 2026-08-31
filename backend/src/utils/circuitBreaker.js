const CircuitBreaker = require('opossum');

const circuitBreakerOptions = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000
};

// Payment Circuit Breaker
const paymentBreaker = new CircuitBreaker(
    async (url, options) => {

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(
                `Payment Service returned ${response.status}`
            );
        }

        return response.json();
    },
    circuitBreakerOptions
);

// Venue Access Circuit Breaker
const venueAccessBreaker = new CircuitBreaker(
    async (url, options) => {

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(
                `Venue Access Service returned ${response.status}`
            );
        }

        return response.json();
    },
    circuitBreakerOptions
);

// Notification Circuit Breaker
const notificationBreaker = new CircuitBreaker(
    async (url, options) => {

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(
                `Notification Service returned ${response.status}`
            );
        }

        return response.json();
    },
    circuitBreakerOptions
);


// ================================
// PAYMENT EVENTS
// ================================

paymentBreaker.on('open', () => {
    console.log(
        '🔴 PAYMENT CIRCUIT OPEN - Payment Service unavailable'
    );
});

paymentBreaker.on('halfOpen', () => {
    console.log(
        '🟡 PAYMENT CIRCUIT HALF-OPEN - Testing Payment Service'
    );
});

paymentBreaker.on('close', () => {
    console.log(
        '🟢 PAYMENT CIRCUIT CLOSED - Payment Service recovered'
    );
});

paymentBreaker.on('timeout', () => {
    console.log(
        '⏱️ PAYMENT CIRCUIT TIMEOUT'
    );
});


// ================================
// VENUE ACCESS EVENTS
// ================================

venueAccessBreaker.on('open', () => {
    console.log(
        '🔴 VENUE ACCESS CIRCUIT OPEN'
    );
});

venueAccessBreaker.on('halfOpen', () => {
    console.log(
        '🟡 VENUE ACCESS CIRCUIT HALF-OPEN'
    );
});

venueAccessBreaker.on('close', () => {
    console.log(
        '🟢 VENUE ACCESS CIRCUIT CLOSED'
    );
});


// ================================
// NOTIFICATION EVENTS
// ================================

notificationBreaker.on('open', () => {
    console.log(
        '🔴 NOTIFICATION CIRCUIT OPEN'
    );
});

notificationBreaker.on('halfOpen', () => {
    console.log(
        '🟡 NOTIFICATION CIRCUIT HALF-OPEN'
    );
});

notificationBreaker.on('close', () => {
    console.log(
        '🟢 NOTIFICATION CIRCUIT CLOSED'
    );
});


module.exports = {
    paymentBreaker,
    venueAccessBreaker,
    notificationBreaker
};