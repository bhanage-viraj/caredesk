# Trivy scan explanation (M6)

Trivy scanned both CareDesk container images (backend and frontend) for OS and library vulnerabilities.

The GitHub Actions workflow fails the job when **HIGH** or **CRITICAL** CVEs are found (with `ignore-unfixed: true` so only actionable findings block the pipeline). A clean result means no unfixed high-severity issues were reported for the scanned layers; any findings should be reviewed, base images updated, or accepted with a documented exception.
