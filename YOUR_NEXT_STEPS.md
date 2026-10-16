# What you still need to do (graded / live items)

The repository code, Compose stack, CI workflow, Terraform, Helm, monitoring values, Argo CD manifest, troubleshooting labs, README, and slide outline are in place. Complete the items below yourself.

## 1. Create GitHub repository and push

```bash
# from project root — after local commits exist
gh repo create caredesk --public --source=. --remote=origin --push
# or: create empty repo on github.com, then:
# git remote add origin https://github.com/<YOU>/caredesk.git
# git push -u origin main
```

## 2. Open Packages (GHCR)

After the first green CI run on `main`, open:

`https://github.com/<YOU>?tab=packages`

Confirm `caredesk-backend` and `caredesk-frontend` images tagged with commit SHAs. Screenshot for M5.

## 3. AWS Console + Terraform (your account)

```bash
aws configure   # Access Key ID, Secret, region ap-south-1
cd terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan    # screenshot
terraform apply   # wait for EKS (~15–20+ min)
```

AWS Console screenshots: VPC + EKS cluster in `ap-south-1`.

```bash
aws eks update-kubeconfig --region ap-south-1 --name caredesk
```

**When demos are done:**

```bash
terraform destroy   # screenshot — mandatory for cost control
```

MCP / Cursor **cannot** log into the AWS Console for you.

## 4. Deploy app on the cluster

```bash
kubectl apply -f k8s/namespace.yaml
# set IMAGE_OWNER and SHA from GHCR
helm upgrade --install caredesk ./helm/caredesk -n caredesk --create-namespace \
  --set backend.image.repository=ghcr.io/<YOU>/caredesk-backend \
  --set backend.image.tag=<SHA> \
  --set frontend.image.repository=ghcr.io/<YOU>/caredesk-frontend \
  --set frontend.image.tag=<SHA> \
  -f helm/caredesk/values-dev.yaml
```

Install ingress controller + metrics-server if missing. Point `/etc/hosts` for `caredesk.local`.

Screenshots: `kubectl get pods`, `kubectl get svc`, `helm list`, browser via Ingress.

## 5. Argo CD (required for video)

Install Argo CD, edit `argocd/application.yaml` repo URL, apply it, show **Synced** in UI.

## 6. Prometheus + Grafana

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace -f monitoring/prometheus-values.yaml
```

Screenshots: `/metrics`, Prometheus target **UP**, Grafana panel with data.

## 7. Convert slides + record video (M10 mandatory)

- Convert [`demo/slides.md`](demo/slides.md) to PPT/PDF (PowerPoint, Google Slides, or `pandoc`) → save as `demo/presentation.pptx` or `demo/slides.pdf`
- Record MP4 covering: PPT → codebase → CI push → Terraform/AWS → Argo CD → kubectl → Prometheus → Grafana
- Upload video via GitHub Release or Git LFS (`demo/*.mp4` is gitignored for size)

## 8. Submission

- Form: https://forms.gle/XWAP1vAumDJgAPM1A  
- Deadline: **Sunday, 19 October 2026, 11:59 PM IST**  
- Submit the public GitHub repo URL  
