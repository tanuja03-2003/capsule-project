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
through the `notification-workers` consumer group. KEDA 2.16.1 scales that
worker deployment from 1 to 5 replicas using the supported Redis Streams
`pendingEntriesCount` metadata.

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

`XINFO GROUPS` also reports a Redis Streams `lag` value. It is useful for
observability, but this installed KEDA scaler is configured and validated with
`pendingEntriesCount`; an unsupported `lagCount` key must not be added blindly.
The demo therefore watches both `pending` and `lag`, while KEDA scales from the
supported pending-entry metric.

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

## KEDA Demonstration

The existing `scripts/keda-load-test.js` publishes finite, legitimate
`TICKET_BOOKED` events to the existing `notifications` stream. It uses Redis
pipelines to create a measurable burst without deleting data, changing the
worker, or manually scaling Kubernetes.

From PowerShell, first verify the clean baseline:

```powershell
kubectl get scaledobject notification-worker-scaler -n eventhub
kubectl get hpa keda-hpa-notification-worker-scaler -n eventhub
kubectl get pods -n eventhub -l app=notification-worker
kubectl exec deployment/redis -n eventhub -- redis-cli XINFO GROUPS notifications
```

Start watches in separate terminals:

```powershell
kubectl get scaledobject notification-worker-scaler -n eventhub -w
kubectl get hpa keda-hpa-notification-worker-scaler -n eventhub -w
kubectl get pods -n eventhub -l app=notification-worker -w
kubectl exec deployment/redis -n eventhub -- redis-cli XINFO GROUPS notifications
```

In another terminal, connect the producer to the existing Redis Service with a
temporary port-forward and publish a finite burst:

```powershell
kubectl port-forward svc/redis 6379:6379 -n eventhub
```

In a separate PowerShell terminal:

```powershell
$env:REDIS_HOST = '127.0.0.1'
$env:REDIS_PORT = '6379'
node scripts/keda-load-test.js 50000 1000
```

The first argument is the finite event count and the second is the pipeline
batch size. Do not run multiple producers indefinitely. While the burst is
processed, inspect:

```powershell
kubectl exec deployment/redis -n eventhub -- redis-cli XINFO GROUPS notifications
kubectl get scaledobject notification-worker-scaler -n eventhub
kubectl get hpa keda-hpa-notification-worker-scaler -n eventhub
kubectl get pods -n eventhub -l app=notification-worker
```

Expected evidence is `pending` above zero, ScaledObject `Active=True`, a
KEDA-generated HPA desired count above one, and two or more Ready worker pods.
The exact peak depends on timing and should not be assumed to reach five.

After the producer exits, stop the port-forward with `Ctrl+C`. Do not delete
the stream or consumer group. Continue watching until `pending=0`, `lag=0`,
and the KEDA-generated HPA returns the worker toward its minimum of one after
the 60-second cooldown.
