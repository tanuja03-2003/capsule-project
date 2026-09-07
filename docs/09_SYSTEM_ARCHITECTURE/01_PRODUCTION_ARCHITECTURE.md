# Production Architecture

Target architecture:

Internet
  -> NGINX Ingress
  -> API Gateway
  -> Kubernetes Services
  -> Application Pods

Supporting platform:
- Kubernetes DNS/service discovery
- HPA + KEDA
- Kafka
- Redis
- Databases
- Prometheus/Grafana
- Loki
- OpenTelemetry/Tempo
- RBAC
- NetworkPolicies
- Secrets/ConfigMaps

Put the final architecture diagram in ../diagrams/.
