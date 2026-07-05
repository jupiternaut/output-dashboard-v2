# Output Dashboard v2

Output Dashboard v2 is a React and Vite dashboard for construction and operations reporting. It shows monthly output, gross profit, collection, unpaid amount, project status, and manager expense metrics from demo data or from a user-imported spreadsheet.

## Current Status

- Status: frontend dashboard demo.
- Branch: `main`.
- Runtime: local Vite development server or static Vite build.
- Data source: generated demo data by default; optional CSV, XLS, or XLSX upload in the browser.
- AI behavior: none. This repository does not require Gemini, AI Studio, or any API key.

## Features

- Operations overview for construction output and payment collection.
- Filters for city, store, and month.
- Metric cards for total output, gross profit, received payment, unpaid payment, in-progress output, pending-start output, completed output, and manager bonus.
- Charts built with Recharts.
- Local CSV and Excel import using PapaParse and XLSX.

## Dependencies

- Node.js 18 or later. Node.js 20 or later is recommended.
- npm.

Application dependencies are declared in `package.json`:

- React 19
- React DOM 19
- Recharts
- Lucide React
- XLSX
- PapaParse
- Vite
- TypeScript

## Build and Run From a Fresh Clone

```bash
git clone https://github.com/jupiternaut/output-dashboard-v2.git
cd output-dashboard-v2
npm install
npm run dev
```

Open the URL printed by Vite. The configured default is `http://localhost:3000` unless that port is already in use.

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Test

There is no automated test suite in this repository. For a smoke test:

1. Run `npm run dev`.
2. Confirm the dashboard loads with the default demo data.
3. Change city, store, and month filters.
4. Import a CSV, XLS, or XLSX file with matching Chinese column headers and confirm the dashboard updates.

## UI and Data Boundaries

- Demo data is generated in `mockData.ts`; values are not production records.
- Imported files are parsed in the browser. The app does not upload the file to a server.
- There is no backend, authentication, persistence layer, or audit trail.
- Date parsing and store normalization are implemented in `utils.ts` and are intended for the current demo schema.
- No `.env.local` file or `GEMINI_API_KEY` is required.

## Screenshots

No screenshot is currently checked in. Suggested placeholder path for future documentation:

```text
docs/screenshots/output-dashboard-v2-overview.png
```

## Issues and Contributions

Use GitHub Issues for bugs, setup problems, or unclear data-format requirements. Pull requests should keep the dashboard schema, file-import behavior, and README instructions aligned.
