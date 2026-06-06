# TCO Repatriation Dashboard Tech Stack

## Recommendation

Use Python Streamlit for the MVP.

The project's credibility comes from the financial model, assumptions, charts, and report output. Streamlit gives the fastest path to a usable dashboard while keeping the calculation engine in plain Python where it is easy to test.

## Options Compared

| Dimension | Streamlit + Python | Next.js + TypeScript | React + FastAPI |
| --- | --- | --- | --- |
| Development speed | High | Medium | Medium |
| Financial calculations | High | Medium | High |
| Dashboard polish | Medium | High | High |
| Presales demo fit | High | High | High |
| Testing formula logic | High | Medium | High |
| Auth and SaaS growth | Medium | High | High |
| Ops burden | Low | Low-Medium | Medium |
| Learning curve | Low | Medium | Medium |
| Best use | MVP and portfolio demo | Polished SaaS-style app | Productized app with API |
| Recommendation | Best first version | Best later UI upgrade | Use when backend API is needed |

## Recommended MVP Stack

| Layer | Choice | Reason |
| --- | --- | --- |
| UI | Streamlit | Fast dashboard delivery |
| Language | Python 3.12+ | Strong calculation and data tooling |
| Validation | Pydantic or dataclasses | Typed assumptions and safer inputs |
| Charts | Plotly | Good interactive financial charts |
| Tables | pandas | Simple monthly projection tables |
| Testing | pytest | Reliable formula validation |
| Persistence | None first, SQLite optional | Avoid unnecessary data handling |
| Export | CSV first, HTML/PDF later | Useful for presales deliverables |
| Deployment | Simple managed app hosting | Low operational overhead |

## Suggested Project Structure

```text
tco-repatriation-dashboard/
  app.py
  src/
    tco/
      __init__.py
      models.py
      calculator.py
      presets.py
      charts.py
      export.py
  tests/
    test_calculator.py
    test_break_even.py
  requirements.txt
  README.md
```

## Core Dependencies

```text
streamlit
pandas
plotly
pydantic
pytest
```

Optional later:

```text
weasyprint or reportlab
sqlalchemy
python-dotenv
```

## Build Principles

- Keep formulas out of `app.py`.
- Keep every user-entered assumption visible in the final report.
- Write tests for the calculation engine before polishing the UI.
- Use user-provided monthly costs rather than hardcoded AWS or OCI prices.
- Treat cloud-provider API import as a future feature, not part of the MVP.

## When To Choose Next.js Instead

Choose Next.js if the goal is a polished SaaS-style portfolio project with login, saved scenarios, and a modern web UI from day one.

Recommended Next.js stack:

- Next.js + React + TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma or Drizzle
- Auth.js or Clerk
- Recharts or Tremor for charts
- Vercel or Render for deployment

Tradeoff: the UI will look more like a commercial SaaS product, but the first version will take longer and the financial model may get less attention.

