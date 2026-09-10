# CI/CD Pipeline

The implemented Jenkins pipeline is defined in the repository-root
`Jenkinsfile`. Detailed setup, credentials, registry, deployment safety, and
rollback instructions are in [docs/jenkins-cicd.md](../jenkins-cicd.md).

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

EventHub uses Jenkins for CI/CD. The pipeline builds the seven existing Docker
images with immutable `BUILD_NUMBER-GIT_COMMIT` tags, runs the backend and API
gateway tests, and can optionally push images and update only the existing
backend and notification-worker Deployments in namespace `eventhub`.

MySQL/PVC, Redis, `backend-hpa`, and the KEDA ScaledObject are existing
infrastructure and are intentionally outside the application deployment step.
