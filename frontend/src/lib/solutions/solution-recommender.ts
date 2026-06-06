// Solution Recommender Engine — scores Dell products against customer profile

import {
  type CustomerProfile,
  type DellProduct,
  type Priorities,
  ALL_PRODUCTS,
  PRODUCT_CATEGORIES,
  INDUSTRY_TALKING_POINTS,
} from "./solution-catalog";

export interface ScoredProduct {
  product: DellProduct;
  score: number;         // 0–100 composite score
  confidence: "Strong" | "Good" | "Acceptable";
}

export interface RecommendationResult {
  stack: ScoredProduct[];           // one product per category
  talkingPoints: string[];          // SA-ready bullet points
  summary: string;                  // narrative recommendation
}

function scoreProduct(product: DellProduct, profile: CustomerProfile): number {
  let score = 0;

  // Workload fit (40% weight)
  const workloadScore = product.workloadFit[profile.workload] || 0;
  score += workloadScore * 4;  // max 40

  // Budget fit (25% weight)
  const budgetScore = product.budgetFit[profile.budget] || 0;
  score += budgetScore * 2.5;  // max 25

  // Priority fit (20% weight) — weighted by customer priority sliders
  const p = profile.priorities;
  const totalP = p.performance + p.cost + p.scalability + p.simplicity || 1;
  let priorityScore = 0;
  priorityScore += (product.priorityFit["Performance"] || 0) * (p.performance / totalP);
  priorityScore += (product.priorityFit["Cost"] || 0) * (p.cost / totalP);
  priorityScore += (product.priorityFit["Scalability"] || 0) * (p.scalability / totalP);
  priorityScore += (product.priorityFit["Simplicity"] || 0) * (p.simplicity / totalP);
  score += priorityScore * 2;  // max ~20

  // Industry bonus (15% weight)
  const industryBonus = product.industryBonus[profile.industry] || 0;
  score += industryBonus * 5;  // max 15

  return Math.min(100, Math.round(score));
}

function getConfidence(score: number): "Strong" | "Good" | "Acceptable" {
  if (score >= 75) return "Strong";
  if (score >= 55) return "Good";
  return "Acceptable";
}

export function recommendSolution(profile: CustomerProfile): RecommendationResult {
  // Score all products
  const scored = ALL_PRODUCTS.map((p) => ({
    product: p,
    score: scoreProduct(p, profile),
  }));

  // Pick best per category
  const stack: ScoredProduct[] = PRODUCT_CATEGORIES.map((cat) => {
    const candidates = scored
      .filter((s) => s.product.category === cat)
      .sort((a, b) => b.score - a.score);

    const best = candidates[0];
    return {
      product: best.product,
      score: best.score,
      confidence: getConfidence(best.score),
    };
  });

  // Generate talking points
  const talkingPoints = generateTalkingPoints(profile, stack);

  // Generate summary narrative
  const summary = generateSummary(profile, stack);

  return { stack, talkingPoints, summary };
}

function generateTalkingPoints(profile: CustomerProfile, stack: ScoredProduct[]): string[] {
  const points: string[] = [];
  const [compute, storage, protection, cloud, svc] = stack;

  // Compute talking point
  points.push(
    `Given your ${profile.workload.toLowerCase()} workload and ${profile.budget} budget, I'd lead with ${compute.product.name} for compute — ${compute.product.tagline.toLowerCase()}.`
  );

  // Storage talking point
  points.push(
    `For storage, ${storage.product.name} is the fit here. ${storage.product.justification.split(".")[0]}.`
  );

  // Data protection is always included
  points.push(
    `Data protection with ${protection.product.name} is essential — ${profile.industry} environments require robust backup and cyber resilience.`
  );

  // Industry-specific points
  const industryPoints = INDUSTRY_TALKING_POINTS[profile.industry];
  if (industryPoints.length > 0) {
    points.push(industryPoints[0]);
  }

  // Priority-based talking point
  const dominantPriority = getDominantPriority(profile.priorities);
  if (dominantPriority === "Cost") {
    points.push(
      `Since cost optimization is a priority, consider ${cloud.product.name} to shift capex to a predictable subscription model.`
    );
  } else if (dominantPriority === "Scalability") {
    points.push(
      `For scalability, ${cloud.product.name} lets you scale without forklift upgrades — grow as demand increases.`
    );
  }

  // Service recommendation
  points.push(
    `I'd include ${svc.product.name} — ${svc.product.tagline.toLowerCase()}. This ensures your team is operational from day one.`
  );

  return points;
}

function generateSummary(profile: CustomerProfile, stack: ScoredProduct[]): string {
  const strongFits = stack.filter((s) => s.confidence === "Strong").length;
  const confidence = strongFits >= 4 ? "high" : strongFits >= 2 ? "moderate" : "mixed";

  const computeName = stack[0].product.name;
  const storageName = stack[1].product.name;
  const svcName = stack[4].product.name;

  return `Based on your ${profile.industry.toLowerCase()} requirements for ${profile.workload.toLowerCase()} workloads within a ${profile.budget} budget, I recommend a stack anchored by ${computeName} and ${storageName}. This combination delivers ${confidence} confidence across all five solution layers. Include ${svcName} to ensure deployment success and ongoing support. ${strongFits >= 4 ? "All layers are strong fits for your requirements." : "Some layers may benefit from further scoping to optimize the fit."}`;
}

function getDominantPriority(p: Priorities): string {
  const entries: [string, number][] = [
    ["Performance", p.performance],
    ["Cost", p.cost],
    ["Scalability", p.scalability],
    ["Simplicity", p.simplicity],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}
