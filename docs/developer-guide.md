# Developer Guide

## Prerequisites

| Tool | Version |
| --- | --- |
| Python | 3.12+ recommended |
| pip | Current Python package installer |
| PowerShell | Used by the documented Windows commands |

The current development machine has been running Python 3.14 successfully.

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Run the app:

```powershell
streamlit run app.py --server.port 8502
```

Run tests:

```powershell
python -m unittest discover
python -m pytest
python -m compileall app.py src tests
```

## Repository Structure

```text
app.py
src/tco/
  __init__.py
  calculator.py
  export.py
  models.py
  presets.py
  recommender.py
tests/
  __init__.py
  test_calculator.py
  test_recommender.py
docs/
  index.md
  user-guide.md
  developer-guide.md
  architecture.md
  calculation-model.md
  recommender.md
  testing.md
  demo-script.md
  troubleshooting.md
.streamlit/
  config.toml
outputs/
  tco-repatriation-dashboard/architecture/
```

## Module Responsibilities

| Path | Responsibility |
| --- | --- |
| `app.py` | Streamlit UI, charts, tabs, input collection, display formatting |
| `src/tco/models.py` | Dataclasses for cloud assumptions, local assumptions, projection rows, and TCO result |
| `src/tco/calculator.py` | Growth calculation, monthly projection, cumulative totals, break-even detection |
| `src/tco/recommender.py` | Rule-based placement recommendation |
| `src/tco/presets.py` | Built-in demo scenarios |
| `src/tco/export.py` | CSV export and executive summary text |
| `tests/test_calculator.py` | Formula and break-even tests |
| `tests/test_recommender.py` | Recommendation path tests |

## Development Rules

- Keep financial logic out of `app.py`.
- Keep recommender rules in `src/tco/recommender.py`.
- Add tests when changing formulas or recommendation logic.
- Avoid adding new sidebar parameters unless the product scope explicitly changes.
- Keep the UI light-only unless theme support is deliberately reintroduced.
- Treat CSV export as a simple output format, not a persistent storage layer.

## Adding A New Preset

Edit `src/tco/presets.py` and add a new `ScenarioPreset`.

Each preset needs:

- `name`
- `description`
- `CloudCostAssumptions`
- `LocalCostAssumptions`

Run:

```powershell
python -m unittest discover
python -m pytest
```

## Changing The TCO Formula

Edit:

```text
src/tco/calculator.py
src/tco/models.py
```

Then update:

```text
tests/test_calculator.py
docs/calculation-model.md
```

## Changing Recommendation Rules

Edit:

```text
src/tco/recommender.py
```

Then update:

```text
tests/test_recommender.py
docs/recommender.md
```

## Changing UI Layout

Most layout code is in `app.py`.

Check these areas:

- CSS block near the top.
- Sidebar input section.
- Chart helper functions.
- Tab rendering in `main()`.

Run:

```powershell
python -m compileall app.py src tests
```

Then manually open:

```text
http://localhost:8502
```

