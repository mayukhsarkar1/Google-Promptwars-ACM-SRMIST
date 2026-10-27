#!/usr/bin/env bash
set -euo pipefail
: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID to your Google Cloud project ID}"
REGION="${GCP_REGION:-asia-south1}"
SERVICE="${SERVICE_NAME:-fairshift}"
REPOSITORY="${ARTIFACT_REPOSITORY:-fairshift}"
IMAGE="${REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${REPOSITORY}/${SERVICE}:$(date -u +%Y%m%d%H%M%S)"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project "$GCP_PROJECT_ID"
if ! gcloud artifacts repositories describe "$REPOSITORY" --location "$REGION" --project "$GCP_PROJECT_ID" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$REPOSITORY" --repository-format docker --location "$REGION" --project "$GCP_PROJECT_ID"
fi
gcloud builds submit --project "$GCP_PROJECT_ID" --tag "$IMAGE" .
gcloud run deploy "$SERVICE" --project "$GCP_PROJECT_ID" --image "$IMAGE" --region "$REGION" --port 8080 --memory 512Mi --cpu 1 --concurrency 40 --max-instances 1 --min-instances 0 --set-env-vars DATABASE_PATH=/app/data/fairshift.db --no-allow-unauthenticated
