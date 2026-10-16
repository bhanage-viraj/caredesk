# CareDesk — DevOps Final Capstone

CareDesk is a clinic appointment management SaaS used to demonstrate a full path from developer laptop to a monitored Kubernetes environment on AWS.

```text
Developer → GitHub → GitHub Actions (pytest, build, Trivy, GHCR)
                 → Terraform (VPC + EKS)
                 → Helm / Argo CD
                 → Frontend + Backend + PostgreSQL
                 → Prometheus + Grafana
```

## Tech stack

| Layer | Tools |
|-------|--------|
| Frontend | React 18, Vite, Nginx |
| Backend | FastAPI, SQLAlchemy, Alembic, Pytest |
| Data | PostgreSQL 16 |
| Containers | Docker, Docker Compose |
| CI/CD | GitHub Actions → GHCR |
| Security | Trivy image scanning |
| IaC | Terraform (AWS VPC + EKS, `ap-south-1`) |
| Orchestration | Kubernetes, Helm, Ingress, HPA |
| GitOps | Argo CD application manifest |
| Observability | Prometheus, Grafana, `/metrics` |

## Architecture

- Browser talks only to `/api/...` (same origin). Nginx (Compose) or Ingress (Kubernetes) routes API traffic to FastAPI.
- Backend exposes `/health` (liveness), `/ready` (DB check), and `/metrics` (Prometheus).
- Images are tagged with the **Git commit SHA** for traceability.
- Classroom PostgreSQL runs in-cluster with a PVC; production would typically use Amazon RDS.

## Local setup (fastest)

Requirements: Docker Desktop / Docker Engine.

```bash
docker compose up --build
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | CareDesk UI |
| http://localhost:8000/docs | Swagger |
| http://localhost:8000/health | Liveness |
| http://localhost:8000/metrics | Prometheus metrics |

Stop:

```bash
docker compose down
# or wipe DB volume:
docker compose down -v
```

## Backend (direct)

Python 3.12+ and PostgreSQL required.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL='postgresql+psycopg://caredesk:caredesk@localhost:5432/caredesk'
alembic upgrade head
uvicorn app.main:app --reload --port 8000
pytest -q
```

## REST API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/appointments` | List appointments |
| GET | `/api/appointments/{id}` | Get one |
| POST | `/api/appointments` | Create |
| PUT | `/api/appointments/{id}` | Update |
| DELETE | `/api/appointments/{id}` | Delete |
| GET | `/api/appointments/stats` | KPI counters |

## CI/CD

Workflow: [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

1. **Test** — pytest + frontend production build  
2. **Build / scan / push** — Docker images → Trivy (fail on HIGH/CRITICAL) → GHCR  
3. **Deploy** — `helm upgrade --install` when repository secret `KUBE_CONFIG` is set  

Image names:

```text
ghcr.io/<github-owner>/caredesk-backend:<git-sha>
ghcr.io/<github-owner>/caredesk-frontend:<git-sha>
```

## Terraform (AWS)

Default region: **ap-south-1**.

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # edit if needed; never commit secrets
aws configure                                  # your credentials
terraform init
terraform plan
terraform apply
```

After apply, configure kubectl using the output command, then destroy when demos finish:

```bash
terraform destroy
```

**You are responsible for AWS cost.** Destroy the stack after evaluation.

## Kubernetes + Helm

```bash
kubectl apply -f k8s/namespace.yaml

helm upgrade --install caredesk ./helm/caredesk \
  --namespace caredesk \
  --create-namespace \
  --set backend.image.repository=ghcr.io/<owner>/caredesk-backend \
  --set backend.image.tag=<sha> \
  --set frontend.image.repository=ghcr.io/<owner>/caredesk-frontend \
  --set frontend.image.tag=<sha> \
  -f helm/caredesk/values-dev.yaml
```

Ingress host (dev values): `caredesk.local` — add to `/etc/hosts` pointing at your Ingress controller IP.

## Argo CD (GitOps)

Manifest: [`argocd/application.yaml`](argocd/application.yaml)

1. Install Argo CD in the cluster  
2. Replace `REPLACE_ME` with your GitHub org/user and repo URL  
3. `kubectl apply -f argocd/application.yaml`  
4. Show the Application as **Synced** in the Argo CD UI for the presentation video  

## Observability

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace \
  -f monitoring/prometheus-values.yaml
```

- Prometheus Targets should show CareDesk ServiceMonitor as **UP**  
- Grafana admin password (values file): `caredesk-admin`  
- Import [`monitoring/grafana-dashboard-caredesk.json`](monitoring/grafana-dashboard-caredesk.json)  

## Troubleshooting lab

```bash
kubectl apply -f troubleshooting/broken-image.yaml
kubectl apply -f troubleshooting/broken-service.yaml
```

Investigate with `kubectl describe`, Events, Endpoints, and labels.

## HPA load helper

```bash
chmod +x scripts/load-test.sh
./scripts/load-test.sh http://<backend>/api/appointments 500
kubectl get hpa -n caredesk -w
```

## Demo artifacts

See [`demo/`](demo/) for the slide deck. Upload your presentation **video (MP4)** to `demo/` via Git LFS or a GitHub Release (large binaries are gitignored by default).

## Known limitations

- In-cluster PostgreSQL is for demos only (not HA).  
- Helm deploy job requires `KUBE_CONFIG` secret; without it, CI still tests, builds, scans, and pushes.  
- Trivy may fail the pipeline on unfixed HIGH/CRITICAL CVEs in base images — investigate and pin/update bases.  
- EKS + NAT Gateway incur AWS charges until `terraform destroy`.  

## Author

Built for the Session 21 DevOps Final Capstone.
