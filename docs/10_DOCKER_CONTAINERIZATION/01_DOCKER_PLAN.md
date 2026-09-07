# Docker Plan

## Goals
- One production image per deployable service
- Small and reproducible images
- Non-root runtime where practical
- Environment configuration outside the image

## Per service
1. Dockerfile
2. .dockerignore
3. Build image
4. Run locally
5. Health check
6. Tag image
7. Push to registry

Useful commands:

```bash
docker build -t <service>:<tag> .
docker images
docker run --name <service> -p <host>:<container> <service>:<tag>
docker ps
docker logs <service>
docker stop <service>
```
