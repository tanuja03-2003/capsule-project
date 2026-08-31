const express = require('express');

const accessController = require('../controllers/accessController');
const router = express.Router();

// router.post('/verify', (req, res) => {
//     const { ticketId } = req.body;

//     if (!ticketId) {
//         return res.status(400).json({
//             success: false,
//             message: 'Ticket ID is required'
//         });
//     }

//     return res.json({
//         success: true,
//         message: 'Ticket verified successfully',
//         ticketId: ticketId,
//         accessGranted: true
//     });
// });

// module.exports = router;


router.post('/tickets', accessController.createAccessTicket);

router.post('/verify', accessController.verifyTicket);

module.exports = router;