#!/usr/bin/env bash
# Simple load generator to exercise HPA in a classroom demo.
set -euo pipefail

TARGET="${1:-http://localhost:8000/api/appointments}"
REQUESTS="${2:-200}"

echo "Sending ${REQUESTS} requests to ${TARGET}"
for i in $(seq 1 "${REQUESTS}"); do
  curl -s -o /dev/null -w "%{http_code}\n" "${TARGET}" || true
done
echo "Done. Watch: kubectl get hpa -n caredesk -w"
