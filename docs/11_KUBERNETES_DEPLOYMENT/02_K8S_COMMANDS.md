# Kubernetes Quick Commands

```bash
kubectl get nodes
kubectl get pods -A
kubectl get deployments -A
kubectl get services -A
kubectl get ingress -A

kubectl describe pod <pod>
kubectl logs <pod>
kubectl logs -f <pod>

kubectl get events --sort-by=.lastTimestamp

kubectl apply -f <manifest>.yaml
kubectl delete -f <manifest>.yaml
```

For production changes, record the reason and rollback procedure in the Operations/Runbooks docs.
