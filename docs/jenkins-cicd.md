# EventHub Jenkins CI/CD

This pipeline builds the existing EventHub services, runs the repository tests, optionally pushes immutable Docker tags, and optionally performs a safe Kubernetes rolling deployment.

## Pipeline Scope

The root `Jenkinsfile` handles these existing Dockerfiles:

- `api-gateway/Dockerfile`
- `backend/Dockerfile`
- `notification-service/Dockerfile`
- `payment-service/Dockerfile`
- `venue-access-service/Dockerfile`
- `service-registry/Dockerfile`
- `nginx/Dockerfile`

The Kubernetes deployment stage updates only the existing `backend` and `notification-worker` Deployments. It does not apply or modify MySQL, the MySQL PVC, Redis, the backend HPA, or the KEDA ScaledObject. Redis, MySQL, HPA, and KEDA are treated as existing infrastructure.

## Jenkins Requirements

The Jenkins agent needs:

- Git
- Node.js and npm
- Docker CLI with permission to use the Docker daemon
- `kubectl`
- `curl`
- Access to the target Kubernetes cluster and the `eventhub` namespace
- Optional: Gitleaks for enforced secret scanning

Recommended Jenkins plugins:

- Pipeline
- Git
- Credentials Binding
- Docker Pipeline (optional; the pipeline uses the Docker CLI)
- Kubernetes CLI (optional; the pipeline uses the configured `kubectl` binary)
- Workspace Cleanup (optional)

## Credentials

Create a Jenkins username/password credential with ID:

```text
docker-registry-credentials
```

The username/password must be for the configured registry. Do not put credentials in the Jenkinsfile, Dockerfiles, Kubernetes manifests, or repository files.

Kubernetes access must be configured on the Jenkins agent using its kubeconfig/context, or through the `KUBE_CONTEXT` parameter. The agent identity needs permission to apply the namespace/backend/worker manifests, update the two application Deployments, read rollout status, and port-forward the backend Service.

## Job Configuration

1. Create a Pipeline or Multibranch Pipeline job.
2. Connect it to the EventHub Git repository.
3. Use the repository root `Jenkinsfile`.
4. Run with `PUSH_IMAGES=false` and `DEPLOY_TO_K8S=false` first.
5. For a registry push, set `REGISTRY_HOST` and `REGISTRY_NAMESPACE`, and use the `docker-registry-credentials` credential.
6. For Kubernetes deployment, set `PUSH_IMAGES=true` and `DEPLOY_TO_K8S=true`. The registry namespace is required so Kubernetes can pull the pushed images.

The default image tag is:

```text
BUILD_NUMBER-GIT_COMMIT
```

An explicit `IMAGE_TAG` can be supplied for a controlled release or rollback.

## Stages

1. **Checkout**: checks out the repository and determines the immutable image tag.
2. **Secrets Detection**: runs Gitleaks when installed and enabled. Existing plaintext credentials in repository files may cause this stage to fail until those credentials are externalized.
3. **Build**: installs locked npm dependencies with `npm ci` where a lockfile
	exists, and uses `npm install` for the API gateway because that service does
	not currently contain a package-lock file.
4. **Unit Tests**: runs the real backend and API gateway test commands and Node syntax checks for the notification worker.
5. **Code Quality**: runs repository lint scripts when present. No lint or SonarQube configuration is currently present, so this is safely skipped.
6. **Docker Build**: builds all seven existing service images.
7. **Docker Push**: logs in with Jenkins credentials and pushes immutable registry tags when enabled.
8. **Kubernetes Deploy**: applies only namespace/backend-service/backend-deployment/notification-worker manifests, then updates backend and worker images with `kubectl set image`.
9. **Rollout Verification**: waits for backend and notification-worker rollouts and prints EventHub resources.
10. **Smoke Test**: port-forwards the backend ClusterIP Service and checks the existing `/health` endpoint.

## Kubernetes Safety

The pipeline contains no destructive commands. It does not delete namespaces, Deployments, PVCs, Services, Redis data, MySQL data, HPA resources, or KEDA resources. It does not apply `k8s/mysql`, `k8s/redis`, `k8s/backend/hpa.yaml`, or `k8s/notification-worker/scaledobject.yaml` during application deployment.

The existing autoscalers remain independent:

```text
backend -> backend-hpa -> CPU utilization
notification-worker -> KEDA-generated HPA -> Redis Stream pending work
```

## Rollback

The pipeline does not perform automatic destructive rollback. For a failed application rollout, inspect the rollout and use the previous ReplicaSet:

```bash
kubectl rollout history deployment/backend -n eventhub
kubectl rollout undo deployment/backend -n eventhub
kubectl rollout history deployment/notification-worker -n eventhub
kubectl rollout undo deployment/notification-worker -n eventhub
kubectl rollout status deployment/backend -n eventhub --timeout=180s
kubectl rollout status deployment/notification-worker -n eventhub --timeout=180s
```

A tag-based rollback can also be performed by setting the previous known-good registry image with `kubectl set image`. Do not roll back MySQL, Redis, HPA, or KEDA as part of an application rollback.

## Local Checks

Jenkins itself is not required for local validation. Run:

```powershell
node --check scripts/keda-load-test.js
node --check notification-service/src/worker.js
Push-Location backend; npm.cmd test; Pop-Location
Push-Location api-gateway; npm.cmd test; Pop-Location
docker compose config --quiet
kubectl apply --dry-run=client -f k8s/namespace.yaml -f k8s/backend/service.yaml -f k8s/backend/deployment.yaml -f k8s/notification-worker/deployment.yaml
```

A real registry push and Kubernetes deployment require Jenkins credentials, a Docker daemon, registry access, and a Jenkins kubeconfig with suitable RBAC permissions.
