# Testing Guide

## Test Commands

Run all unittest tests:

```powershell
python -m unittest discover
```

Run pytest:

```powershell
python -m pytest
```

Compile Python files:

```powershell
python -m compileall app.py src tests
```

## Current Test Files

| File | Coverage |
| --- | --- |
| `tests/test_calculator.py` | TCO totals, break-even, cloud discount, negative local case |
| `tests/test_recommender.py` | Main recommendation paths |

## Calculator Test Cases

Current cases:

- No-growth projection totals.
- Migration cost delays break-even.
- Cloud discount is applied before projection.
- Break-even is not reached when local is always more expensive.

## Recommender Test Cases

Current cases:

- Repatriation candidate when savings and break-even are strong.
- Hybrid candidate when savings are positive but break-even is late.
- Cloud-first candidate when local is more expensive and run-rate is not better.
- Validate assumptions when the result is close.

## Manual UI Verification

After code changes:

1. Start the app.

```powershell
streamlit run app.py --server.port 8502
```

2. Open:

```text
http://localhost:8502
```

3. Check:

- Sidebar inputs load.
- Presets apply.
- Overview charts render.
- Recommendation tab renders.
- Assumptions tab shows correct values.
- Monthly detail table renders.
- CSV download works.

## Expected Test Result

At the time this documentation was written:

```text
8 tests passing
```

## Future Test Gaps

Recommended future tests:

- CSV export output shape.
- Executive summary text for positive and negative savings.
- Preset validity.
- Chart helper functions returning Plotly figures.
- Edge cases for zero cloud spend and zero local spend.

