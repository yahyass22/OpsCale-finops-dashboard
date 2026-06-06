# Troubleshooting

## Streamlit Is Not Installed

Symptom:

```text
ModuleNotFoundError: No module named 'streamlit'
```

Fix:

```powershell
pip install -r requirements.txt
```

## Port 8502 Is Already In Use

Symptom:

```text
Port 8502 is already in use
```

Fix option 1: run on another port.

```powershell
streamlit run app.py --server.port 8503
```

Fix option 2: find the process.

```powershell
Get-NetTCPConnection -LocalPort 8502
```

Then stop the process if it is safe to do so.

## Tests Do Not Discover

Use explicit discovery:

```powershell
python -m unittest discover -s tests -p "test_*.py"
```

The project includes `tests/__init__.py`, so normal discovery should also work:

```powershell
python -m unittest discover
```

## Compileall Permission Error

Symptom:

```text
PermissionError: Access denied ... __pycache__
```

Likely cause:

```text
The Streamlit server is running and has imported the package.
```

Fix:

1. Stop Streamlit.
2. Run compile verification.
3. Restart Streamlit.

```powershell
python -m compileall app.py src tests
streamlit run app.py --server.port 8502
```

## App Theme Looks Wrong

The app is configured as light-only.

Check:

```text
.streamlit/config.toml
```

Expected:

```toml
[theme]
base = "light"
```

If the browser still shows stale styling, refresh the page or restart Streamlit.

## CSV Download Name Looks Odd

The CSV filename is based on the scenario name.

If the scenario name has unusual characters, change it in the sidebar before downloading.

## Recommendation Seems Unexpected

Check:

- Savings percent.
- Break-even month.
- Monthly run-rate delta.
- Cloud discount.
- Dominant cloud cost category.

Then read:

```text
docs/recommender.md
```

The recommendation is rule-based and conservative. It does not know workload architecture or compliance constraints.

