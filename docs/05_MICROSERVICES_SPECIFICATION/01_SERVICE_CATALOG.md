# Microservices Catalog

| Service | Responsibility | Port | Database | Dependencies |
|---|---|---:|---|---|
| API Gateway | Routing/auth/rate limiting | ____ | - | All services |
| Event Service | Events/venues | ____ | ____ | DB |
| Booking Service | Reservations/tickets | ____ | ____ | Event/Payment |
| Payment Service | Payment workflow | ____ | ____ | DB/Kafka |
| Venue Access Service | Ticket/access validation | ____ | ____ | Redis/Event |
| Notification Service | Email/SMS/notifications | ____ | ____ | Kafka |

Keep one row per deployed service.
