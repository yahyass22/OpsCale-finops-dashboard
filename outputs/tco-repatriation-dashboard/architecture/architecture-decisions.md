# Architecture Decisions

## ADR-001: Use a Modular Monolith for the MVP

Status: Accepted

Decision:

Build the first version as a single Streamlit application with separate Python modules for models, calculations, charts, and exports.

Rationale:

- The app is small and calculation-heavy.
- A separate API would add overhead before there is real product complexity.
- Keeping the calculation engine modular allows reuse if a React frontend is added later.

Consequences:

- Faster MVP delivery.
- Lower deployment complexity.
- UI and backend are in one runtime.
- Future SaaS version may need an API extraction.

## ADR-002: Use Manual Cost Inputs First

Status: Accepted

Decision:

The MVP will use manual cloud cost inputs instead of AWS Cost Explorer, OCI billing APIs, or uploaded billing exports.

Rationale:

- Manual entry matches the original business problem.
- It avoids credentials, permissions, and customer data risk.
- It keeps the first version explainable and demo-friendly.

Consequences:

- Less automation.
- Easier to validate and demonstrate.
- Cloud billing integrations can be added later.

## ADR-003: Separate Financial Logic From UI

Status: Accepted

Decision:

TCO formulas, projection logic, break-even calculation, and sensitivity calculations must live outside the Streamlit page code.

Rationale:

- Financial logic needs tests.
- UI code changes frequently.
- The same engine may later support a REST API or report generator.

Consequences:

- Slightly more structure up front.
- Much better maintainability and credibility.

## ADR-004: Avoid Persistent Customer Data in MVP

Status: Accepted

Decision:

The MVP should not store customer scenarios by default.

Rationale:

- Cost data can be sensitive.
- Avoiding persistence avoids auth, encryption, backups, and retention obligations.
- Export files are enough for a first demo.

Consequences:

- Users must re-enter or import assumptions.
- Saved scenarios require a later persistence feature.

## ADR-005: Use 36-Month Monthly Projection

Status: Accepted

Decision:

Calculate TCO as a month-by-month projection over 36 months rather than a single annual multiplier.

Rationale:

- Break-even month matters in presales conversations.
- Growth and migration costs are easier to model over time.
- Charts become more persuasive and easier to inspect.

Consequences:

- Slightly more calculation complexity.
- More useful output for finance and executive stakeholders.

