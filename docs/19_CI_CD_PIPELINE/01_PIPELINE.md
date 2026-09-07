# CI/CD Pipeline

Suggested flow:

Git push
  -> lint
  -> unit tests
  -> integration tests
  -> build Docker images
  -> security/image scan
  -> push to registry
  -> deploy to Kubernetes
  -> smoke tests
  -> promote/rollback

Record:
- CI tool
- Registry
- Image tags
- Environments
- Deployment strategy
- Rollback process
