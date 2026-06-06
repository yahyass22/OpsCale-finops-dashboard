# Getting Started

This guide covers setup for both the **Next.js frontend** (primary) and the **Streamlit frontend** (legacy).

## Prerequisites

| Tool | Version | Required For |
|------|---------|-------------|
| Node.js | 18+ | Next.js frontend |
| npm | 9+ | Next.js dependency management |
| Python | 3.11+ | Streamlit app and calculation tests |
| pip | Latest | Python dependency management |

## Next.js Frontend (Primary)

### Install and Run

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The dev server supports hot reload — changes to any component are reflected immediately.

### Production Build

```bash
npm run build
```

This generates a fully static site in the `frontend/out/` directory. Deploy it to any static host:

- **Vercel**: `npx vercel --prod` from the `frontend/` directory
- **GitHub Pages**: Upload the `out/` folder contents
- **Any web server**: Serve the `out/` directory with any HTTP server

### Lint

```bash
npm run lint
```

## Streamlit Frontend (Legacy)

### Install and Run

```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# Run the Streamlit app
streamlit run app.py --server.port 8502
```

Open [http://localhost:8502](http://localhost:8502) in your browser.

### macOS/Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py --server.port 8502
```

## Running Tests

The Python calculation engine includes unit tests for the TCO calculator and placement recommender:

```bash
# Run all tests
python -m pytest

# Run with verbose output
python -m pytest -v

# Run specific test file
python -m pytest tests/test_calculator.py
python -m pytest tests/test_recommender.py

# Compile check all Python files
python -m compileall app.py src tests
```

## Using the Dashboard

### 1. Start with a Preset

The top bar includes a **Scenario** dropdown with built-in presets:

- **Steady VM estate** — Balanced compute and storage
- **Storage-heavy archive** — Large storage footprint with high growth
- **Compute-heavy platform** — High compute run-rate with cloud discounts

Selecting a preset fills all cost fields with representative values.

### 2. Adjust the Projection Window

Use the **Window** slider (12–60 months) to change the analysis horizon. All charts and metrics update in real time.

### 3. Navigate Sections

Use the sidebar to switch between:

| Section | What it does |
|---------|-------------|
| **Dashboard** | KPI cards, 10+ charts, migration analysis, AI insights |
| **Cost Inputs** | Edit cloud and local costs by category |
| **Solution Recommender** | Configure customer profile, get Dell stack recommendation |
| **Report** | Document-style report with PDF print and Excel export |

### 4. Export

From the Report page:

- **Print / Save PDF** — Opens browser print dialog with optimized A4 layout
- **Export Excel** — Downloads a 5-sheet `.xlsx` workbook
- **Export CSV** — Downloads a plain-text summary

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `npm install` fails | Delete `frontend/node_modules` and `frontend/package-lock.json`, then retry |
| Port 3000 in use | Run `npm run dev -- -p 3001` for a different port |
| Blank page after build | Check browser console for errors; ensure `output: "export"` in next.config |
| Python import errors | Ensure virtual environment is activated before running |
| Streamlit theme issues | The app uses a light-only theme configured in `.streamlit/config.toml` |
| Charts not rendering | Recharts requires a visible container — ensure the section is active |

## Environment Variables

The project does not require any environment variables for local development. All calculation runs client-side. No API keys, database connections, or cloud credentials are needed.

## IDE Setup

Recommended VS Code extensions:

- **ESLint** — Linting for TypeScript/React
- **Tailwind CSS IntelliSense** — Class name autocomplete
- **Python** — IntelliSense and debugging for Streamlit app
- **Prettier** — Code formatting (optional, not enforced)
