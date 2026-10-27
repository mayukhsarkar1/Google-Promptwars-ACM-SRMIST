# FairShift: Decent Work Platform

A Prompt Wars 2026 prototype aligned with UN SDG 8. Next.js App Router, TypeScript, Tailwind CSS, and SQLite support construction and campus workforces. All seeded identities and badges are fictional.

## Local development

Requires Node.js 24 and npm. SQLite uses Node's built-in `node:sqlite` module; the runtime may print an experimental feature warning.

```bash
npm ci
npm run dev
# Worker interface: /worker; employer dashboard: /admin
npm test
npm run build
PORT=8080 npm start
```

The database is created and seeded on first API request at `data/fairshift.db`. Set `DATABASE_PATH` to override. No API keys are required. `.env.example` documents optional settings. No third-party fonts, map services, or images are required.

## Features

- One-tap shift start/end with server timestamps and one-active-shift enforcement in SQLite. Duplicate start/end actions are rejected. Refreshes every 15 seconds.
- Four-language worker navigation and payslip: English, Hindi, Tamil, Telugu. Payslip modal shows regular and overtime pay, with native browser text-to-speech.
- Anonymous report creation with a receipt ID and status tracking; employer ticket status management. Report records do not store a worker ID. Messages can still identify the sender if they include personal details.
- Fatigue flags: shift over 12 hours, over 48 hours in the rolling seven days, or rest under 11 hours. These are demonstration rules, not jurisdiction-specific legal advice.
- Transparent wellbeing support indicators based on fatigue and self-reported sentiment. No ML or individual attrition prediction is claimed.
- Skill passport with training badges, completed recorded hours, and JSON download. Demo badges are not externally verified.
- Speech input where browser support and permission allow it; text input remains available. Browser speech services may process audio externally. Native voices depend on installed language support.

Pay uses ₹ INR, an eight-hour regular allowance per shift and 1.5× overtime. The displayed estimate includes all recorded demo shifts and active time, without taxes or deductions. It is not a statutory payroll system. One-tap attendance is supported; QR identity verification and geofencing are not implemented.

## Container testing

```bash
docker build -t fairshift:local .
docker run --rm -p 8080:8080 fairshift:local
# In another terminal:
curl --fail http://localhost:8080/api/platform
```

The multi-stage image runs as the non-root `node` user, binds `0.0.0.0:8080`, and uses Next.js standalone output. Docker excludes environment files and local data.

## Google Cloud Run deployment

Hosting target: Google Cloud Run only. Install Google Cloud CLI, authenticate with a principal allowed to create Cloud Build jobs, Artifact Registry repositories, and Cloud Run services. Enable billing on the project. Your Cloud Build service account needs Artifact Registry write permissions; the deployer needs permission to act as the runtime service account.

```bash
gcloud auth login
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="asia-south1"
./deploy.sh
```

The script enables required APIs, creates the Docker repository if needed, builds via Cloud Build and deploys a private service. To access the private deployment during testing:

```bash
gcloud run services proxy fairshift --project "$GCP_PROJECT_ID" --region "$GCP_REGION" --port 8080
```

For an intentionally public hackathon demo containing only synthetic data, explicitly grant public invocation:

```bash
gcloud run services add-iam-policy-binding fairshift \
  --project "$GCP_PROJECT_ID" --region "$GCP_REGION" \
  --member="allUsers" --role="roles/run.invoker"
```

**Prototype boundaries:** Worker selection and employer access are demonstration controls, not authentication or authorization. Any caller with service access can read and mutate demo data. Do not enter actual worker details. Deploy real use only after adding identity, server-enforced roles and tenant isolation, abuse prevention, audit trails, a durable shared database, privacy controls, and payroll policy review.

Cloud Run's writable filesystem is ephemeral, consumes instance memory, and is not shared between instances. Scaling to zero, restart, or deployment can reset the SQLite demo. `--max-instances 1` reduces simultaneous demo copies but does not provide persistence; revisions can also overlap. Use Firestore or a managed relational database before durable or multi-instance use.

## Project map

- `app/worker` — mobile worker interface
- `app/admin` — multi-sector employer dashboard
- `app/api/platform` — validated demo API
- `lib/db.ts` — SQLite schema and synthetic seeds
- `lib/calculations.ts` — shift, overtime, and fatigue rules
- `lib/translations.ts` — four-language dictionary
- `components/voice.tsx` — browser voice controls and fallbacks
- `tests/calculations.test.ts` — utility tests

Accessibility includes semantic labels, keyboard controls, visible focus, large touch targets, skip link, live feedback and a native modal dialog. Automated checks do not replace screen-reader, translation, and WCAG audits.

## Validation in the onboarding environment

- 11 Vitest unit tests passed; TypeScript and the Next.js production build passed.
- Chromium smoke checks passed for desktop search, mobile check-in/out, four language selections, the payslip modal, anonymous reporting, and employer resolution.
- axe-core scans of the default employer and worker screens reported no WCAG 2 A/AA or 2.1 AA violations after contrast fixes. Other states and assistive technologies still require manual review.
- The standalone server was exercised on port 8081 in this workspace. Browser voice permissions and actual speech recognition were not automated.
- The full Docker build's dependency-download step could not complete because containers could not resolve/reach the npm registry in this environment, including host networking. TLS verification remained enabled. Re-run the documented build on a network-enabled Docker host or Google Cloud Build.
- A separate runtime-only image assembled from the locally built standalone output passed: non-root execution, port 8080 binding, SQLite seeding, API response, and worker page HTTP 200. This validates container runtime behavior, not the full multi-stage dependency installation.
