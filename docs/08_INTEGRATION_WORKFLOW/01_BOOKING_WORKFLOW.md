# Booking Workflow

Document the end-to-end flow:

1. Customer selects event/tickets
2. Booking request reaches API Gateway
3. Booking Service validates availability
4. Inventory/seat state is reserved
5. Payment is requested
6. Payment result is received
7. Booking is confirmed or cancelled
8. Ticket is generated
9. Booking/payment events are published
10. Notification is sent

Record synchronous calls and asynchronous events separately.
