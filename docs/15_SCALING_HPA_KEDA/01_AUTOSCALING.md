# Autoscaling: HPA + KEDA

## HPA
Use for workloads where CPU/memory or configured metrics represent load.

Example:
Booking API -> HPA -> increase Pods during high CPU/request load.

## KEDA
Use for event-driven workloads.

Example:
Kafka consumer lag -> KEDA -> increase Notification/Payment consumer Pods.

Document:
- min replicas
- max replicas
- target metrics
- scale-up behavior
- scale-down behavior
- cooldown/stabilization
- KEDA triggers
