# CareDesk — Capstone Presentation

## Slide 1 — Project overview
- **CareDesk**: clinic appointment management SaaS
- Goal: show the full path from laptop → GitHub → CI → GHCR → AWS EKS → monitoring
- Domain is clinic operations (not a TaskBoard clone)

## Slide 2 — Tech stack
- React + Vite + Nginx
- FastAPI + SQLAlchemy + Alembic + PostgreSQL
- Pytest, Docker Compose
- GitHub Actions, Trivy, GHCR
- Terraform, EKS, Helm, Ingress, HPA
- Prometheus + Grafana + Argo CD

## Slide 3 — Architecture
```text
Browser → Ingress/Nginx → Frontend | /api → Backend → PostgreSQL
                                      ↓
                               /metrics → Prometheus → Grafana
```
- `/health` = liveness, `/ready` = DB readiness

## Slide 4 — CI/CD flow
1. Push to `main`
2. Pytest + frontend build
3. Docker build (backend + frontend)
4. Trivy HIGH/CRITICAL gate
5. Push SHA-tagged images to GHCR
6. Optional Helm deploy with `KUBE_CONFIG`

## Slide 5 — Infrastructure (Terraform)
- Region: `ap-south-1`
- VPC, 2 public + 2 private subnets, NAT, IGW
- EKS cluster + managed node group
- Destroy after demo to control cost

## Slide 6 — Kubernetes setup
- Namespace `caredesk`
- Helm chart: deployments, services, postgres PVC, ingress, HPA, ServiceMonitor
- Argo CD Application syncs the Helm path from Git

## Slide 7 — Observability
- Backend `/metrics` (Prometheus format)
- ServiceMonitor scrapes backend
- Grafana dashboard: request rate, latency, errors
- HPA scales backend on CPU

## Slide 8 — Key learnings
- Tests before image promotion
- SHA tags = production ↔ commit traceability
- Ingress is config; controller implements it
- Services select pods by labels
- IaC + GitOps reduce snowflake clusters
