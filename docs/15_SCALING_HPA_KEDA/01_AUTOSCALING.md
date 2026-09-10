# Autoscaling: HPA + KEDA

## HPA
Use for workloads where CPU/memory or configured metrics represent load.

Example:
Booking API -> HPA -> increase Pods during high CPU/request load.

## KEDA
Use for event-driven workloads.

The EventHub backend uses a CPU-based HPA. It publishes `TICKET_BOOKED`
notification events to the internal Redis `notifications` stream. The reused
notification-service image runs a worker deployment that consumes the stream
through the `notification-workers` consumer group. KEDA scales that worker
deployment from 1 to 5 replicas using the Redis Streams pending-entry count.

```text
Backend -> Redis notifications stream -> Notification Worker
									  ^
									  |
							 KEDA pending entries
```

The worker acknowledges a stream entry only after the existing notification
processor succeeds. Failed entries remain pending and can be reclaimed after
they have been idle for one minute.

Example:
Redis stream pending entries -> KEDA -> increase Notification Worker Pods.

Document:
- min replicas
- max replicas
- target metrics
- scale-up behavior
- scale-down behavior
- cooldown/stabilization
- KEDA triggers

Current configuration:
- Backend HPA: `backend-hpa`, CPU target 50%, 1-5 replicas.
- Notification KEDA: `notification-worker-scaler`, Redis Streams trigger,
  pending-entry threshold 1, 1-5 replicas, 60-second cooldown.
