# Q&A Prep

## Why did you build this project?

Strong answer:

```text
I wanted to build something that reflects presales work, not just software development. Cloud cost pressure is a real business issue, and the right answer is often not cloud or on-premises, but workload placement. This project lets me show technical modeling, business value framing, and customer-facing recommendation skills.
```

## How does this relate to Dell?

Strong answer:

```text
Dell is strongly positioned around hybrid infrastructure, modern data centers, private cloud, edge, as-a-Service consumption, and enterprise AI infrastructure. This project aligns with those conversations because it helps customers reason about where workloads should run and what the financial impact is.
```

## Is this a Dell product?

Strong answer:

```text
No. It is a candidate-built project. I use Dell's public messaging only as alignment context. The project demonstrates how I think about customer problems Dell is well positioned to solve.
```

## Why not just compare AWS pricing to Dell hardware pricing?

Strong answer:

```text
That would look more precise but would be less credible without real customer workload data and vendor quotes. I designed the tool around customer-provided assumptions so the conversation stays transparent. In a real sales motion, this could be extended with validated pricing and account-specific inputs.
```

## Why did you add a hybrid recommendation?

Strong answer:

```text
Because most real infrastructure decisions are not binary. Some workloads need cloud elasticity or managed services. Others are predictable and may be better suited to local infrastructure. The hybrid recommendation makes the tool more realistic and closer to how a solution architect would guide a customer.
```

## Why is the recommender rule-based instead of AI-based?

Strong answer:

```text
For a presales tool, explainability matters. A rule-based recommender lets the customer see the logic. It avoids black-box recommendations and prevents false precision.
```

## What would you improve next?

Strong answer:

```text
I would add a customer-ready PDF report, scenario comparison, and an optional billing CSV import. I would also add a Dell solution mapping layer if this were used in a Dell-specific context, but I avoided pretending this candidate project has official product pricing or configuration logic.
```

## What technical choices did you make?

Strong answer:

```text
I used Streamlit because the goal was fast presales workflow validation. I separated the calculation engine, models, recommender, presets, and exports into modules so the logic is testable and could later support a React frontend or API.
```

## How did you make sure the numbers are reliable?

Strong answer:

```text
The formulas are isolated in the calculator module and covered by tests. I added tests for no-growth totals, discount handling, delayed break-even, cases where break-even is not reached, and the main recommender paths.
```

## What does this show about you as a candidate?

Strong answer:

```text
It shows I can connect technical architecture to customer value. I can build the tool, explain the business problem, communicate tradeoffs, and avoid overclaiming. That is the kind of discipline I think matters in presales.
```

## Hard Question: Isn't this too simple?

Strong answer:

```text
The calculation is intentionally simple enough to be explainable. In presales, a model the customer trusts is more useful than a complex model they cannot challenge. I focused the MVP on transparency, then documented the path to deeper functionality like billing import, PDF output, and solution mapping.
```

## Hard Question: What if cloud is still cheaper?

Strong answer:

```text
Then the recommendation should say cloud-first. The goal is not to force repatriation. The goal is to guide the customer toward the right placement decision. A credible presales architect should be willing to tell the customer when the proposed direction is not justified.
```

## Hard Question: What makes this presales and not just finance?

Strong answer:

```text
The tool does not stop at cost. It connects cost to workload placement and architecture choices. It shows when to keep elastic workloads cloud-side, when to evaluate storage-heavy workloads locally, and when to validate assumptions before recommending anything.
```

