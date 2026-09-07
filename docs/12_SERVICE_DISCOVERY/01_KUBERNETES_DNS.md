# Kubernetes Service Discovery

Inside a Kubernetes cluster, applications should normally call a Kubernetes Service by DNS name rather than Pod IP.

Example:

```text
http://payment-service:3004
```

Do not hard-code Pod IP addresses.

Document:
- Service names
- Ports
- Namespaces
- Cross-namespace DNS names if used
