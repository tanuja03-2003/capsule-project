

require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3001;



app.listen(PORT, async () => {

    console.log(
        `Venue Access Microservice listening on port ${PORT}`
    );

    // Automatically register with Service Registry
    await registerService();

});

const registerService =
    require('./serviceRegistry');