# Testing Strategy

Layers:
1. Unit tests
2. Integration tests
3. API/contract tests
4. Database tests
5. Kafka/event tests
6. End-to-end tests
7. Load/performance tests
8. Kubernetes smoke tests

Critical E2E scenario:
Event discovery -> ticket selection -> booking -> payment -> ticket issuance -> venue access validation.
