// Dell Solution Catalog — product portfolio & matching rules for Solution Recommender

export type Industry = "Healthcare" | "Financial Services" | "Manufacturing" | "Education" | "Retail" | "Technology";
export type WorkloadType = "Virtualization" | "Database" | "AI/ML" | "VDI" | "Mixed/HCI";
export type BudgetTier = "<$50K" | "$50–150K" | "$150–500K" | "$500K+";
export type Priority = "Performance" | "Cost" | "Scalability" | "Simplicity";

export interface Priorities {
  performance: number; // 0–100
  cost: number;
  scalability: number;
  simplicity: number;
}

export interface CustomerProfile {
  industry: Industry;
  workload: WorkloadType;
  budget: BudgetTier;
  priorities: Priorities;
}

export interface DellProduct {
  id: string;
  name: string;
  category: "Compute" | "Storage" | "Data Protection" | "Hybrid Cloud" | "Services";
  tagline: string;
  justification: string;
  priceHint: string;
  // Matching scores (0–10)
  workloadFit: Partial<Record<WorkloadType, number>>;
  budgetFit: Partial<Record<BudgetTier, number>>;
  priorityFit: Partial<Record<Priority, number>>;
  industryBonus: Partial<Record<Industry, number>>;
}

export const INDUSTRIES: Industry[] = ["Healthcare", "Financial Services", "Manufacturing", "Education", "Retail", "Technology"];
export const WORKLOADS: WorkloadType[] = ["Virtualization", "Database", "AI/ML", "VDI", "Mixed/HCI"];
export const BUDGET_TIERS: BudgetTier[] = ["<$50K", "$50–150K", "$150–500K", "$500K+"];

// ── Compute ──────────────────────────────────────────────
const compute: DellProduct[] = [
  {
    id: "pe-r760",
    name: "PowerEdge R760",
    category: "Compute",
    tagline: "2-socket rack server — the virtualization workhorse",
    justification: "The R760 delivers balanced compute density for general virtualization. Dual 5th Gen Xeon, up to 8TB DDR5, and NVMe caching make it ideal for VM-dense environments at a mid-range price point.",
    priceHint: "$12–25K per node",
    workloadFit: { Virtualization: 9, Database: 7, VDI: 8, "Mixed/HCI": 7, "AI/ML": 4 },
    budgetFit: { "<$50K": 6, "$50–150K": 9, "$150–500K": 7, "$500K+": 5 },
    priorityFit: { Performance: 7, Cost: 8, Scalability: 7, Simplicity: 8 },
    industryBonus: { Healthcare: 1, Education: 1, Retail: 1 },
  },
  {
    id: "pe-r960",
    name: "PowerEdge R960",
    category: "Compute",
    tagline: "4-socket mission-critical server for databases",
    justification: "The R960 is purpose-built for in-memory databases and mission-critical workloads. Four Xeon Scalable sockets, massive memory bandwidth, and RAS features deliver the reliability your database tier demands.",
    priceHint: "$35–65K per node",
    workloadFit: { Virtualization: 5, Database: 10, VDI: 4, "Mixed/HCI": 4, "AI/ML": 6 },
    budgetFit: { "<$50K": 2, "$50–150K": 6, "$150–500K": 9, "$500K+": 9 },
    priorityFit: { Performance: 10, Cost: 4, Scalability: 6, Simplicity: 5 },
    industryBonus: { "Financial Services": 2, Healthcare: 1 },
  },
  {
    id: "vxrail-v570",
    name: "VxRail V570",
    category: "Compute",
    tagline: "Hyperconverged infrastructure with VMware integration",
    justification: "VxRail V570 delivers turnkey HCI with full VMware lifecycle management. It scales from 4 to 64 nodes with automated patching — perfect for teams wanting simplicity without sacrificing scalability.",
    priceHint: "$45–80K per node",
    workloadFit: { Virtualization: 8, Database: 6, VDI: 9, "Mixed/HCI": 10, "AI/ML": 3 },
    budgetFit: { "<$50K": 3, "$50–150K": 7, "$150–500K": 9, "$500K+": 8 },
    priorityFit: { Performance: 7, Cost: 5, Scalability: 10, Simplicity: 10 },
    industryBonus: { Healthcare: 2, Education: 2, Retail: 1 },
  },
  {
    id: "pe-xe9680",
    name: "PowerEdge XE9680",
    category: "Compute",
    tagline: "GPU-dense server for AI training & inference",
    justification: "The XE9680 supports up to 8 NVIDIA H100 GPUs in a single 6U chassis. It's the Dell platform for serious AI/ML workloads — from model training to real-time inference at the edge or in the data center.",
    priceHint: "$80–200K per node",
    workloadFit: { Virtualization: 2, Database: 3, VDI: 2, "Mixed/HCI": 2, "AI/ML": 10 },
    budgetFit: { "<$50K": 1, "$50–150K": 3, "$150–500K": 8, "$500K+": 10 },
    priorityFit: { Performance: 10, Cost: 2, Scalability: 7, Simplicity: 3 },
    industryBonus: { Manufacturing: 2, Technology: 2, Healthcare: 1 },
  },
];

// ── Storage ──────────────────────────────────────────────
const storage: DellProduct[] = [
  {
    id: "ps-1200t",
    name: "PowerStore 1200T",
    category: "Storage",
    tagline: "Mid-range unified storage — performance per dollar leader",
    justification: "PowerStore 1200T offers NVMe all-flash with 4:1 guaranteed data reduction. It's the sweet spot for mid-size deployments needing reliable, easy-to-manage unified storage without over-provisioning.",
    priceHint: "$30–60K per appliance",
    workloadFit: { Virtualization: 8, Database: 6, VDI: 7, "Mixed/HCI": 8, "AI/ML": 3 },
    budgetFit: { "<$50K": 7, "$50–150K": 9, "$150–500K": 7, "$500K+": 4 },
    priorityFit: { Performance: 6, Cost: 9, Scalability: 7, Simplicity: 9 },
    industryBonus: { Education: 2, Retail: 1 },
  },
  {
    id: "ps-5200t",
    name: "PowerStore 5200T",
    category: "Storage",
    tagline: "High-performance all-flash for demanding workloads",
    justification: "PowerStore 5200T delivers sub-100μs latency with inline deduplication and compression. Ideal for database-heavy or latency-sensitive workloads where every millisecond matters.",
    priceHint: "$60–120K per appliance",
    workloadFit: { Virtualization: 8, Database: 9, VDI: 7, "Mixed/HCI": 7, "AI/ML": 5 },
    budgetFit: { "<$50K": 3, "$50–150K": 7, "$150–500K": 9, "$500K+": 7 },
    priorityFit: { Performance: 9, Cost: 6, Scalability: 8, Simplicity: 7 },
    industryBonus: { "Financial Services": 2, Healthcare: 1 },
  },
  {
    id: "pmax-2500",
    name: "PowerMax 2500",
    category: "Storage",
    tagline: "Mission-critical enterprise storage — 6 nines availability",
    justification: "PowerMax 2500 is the gold standard for mission-critical storage. NVMe end-to-end, SRDF replication, and 99.9999% availability make it the choice for databases and applications that simply cannot go down.",
    priceHint: "$150–350K per system",
    workloadFit: { Virtualization: 5, Database: 10, VDI: 4, "Mixed/HCI": 4, "AI/ML": 4 },
    budgetFit: { "<$50K": 1, "$50–150K": 3, "$150–500K": 8, "$500K+": 10 },
    priorityFit: { Performance: 10, Cost: 3, Scalability: 7, Simplicity: 4 },
    industryBonus: { "Financial Services": 3, Healthcare: 2 },
  },
  {
    id: "pscale-f710",
    name: "PowerScale F710",
    category: "Storage",
    tagline: "Scale-out NAS for unstructured data & AI pipelines",
    justification: "PowerScale F710 delivers massive parallel throughput for unstructured data. OneFS simplifies management at petabyte scale — purpose-built for AI training datasets, media workflows, and genomic analysis.",
    priceHint: "$80–250K per cluster",
    workloadFit: { Virtualization: 3, Database: 2, VDI: 3, "Mixed/HCI": 4, "AI/ML": 10 },
    budgetFit: { "<$50K": 2, "$50–150K": 5, "$150–500K": 8, "$500K+": 9 },
    priorityFit: { Performance: 9, Cost: 5, Scalability: 10, Simplicity: 6 },
    industryBonus: { Manufacturing: 2, Technology: 2, Healthcare: 1 },
  },
];

// ── Data Protection ──────────────────────────────────────
const dataProtection: DellProduct[] = [
  {
    id: "pp-dd6900",
    name: "PowerProtect DD6900",
    category: "Data Protection",
    tagline: "Mid-range data domain — up to 65:1 deduplication",
    justification: "PowerProtect DD6900 delivers industry-leading deduplication (up to 65:1) and immutable backup copies. It's the right-sized data protection platform for mid-market and departmental deployments.",
    priceHint: "$25–50K per appliance",
    workloadFit: { Virtualization: 8, Database: 7, VDI: 7, "Mixed/HCI": 8, "AI/ML": 5 },
    budgetFit: { "<$50K": 7, "$50–150K": 9, "$150–500K": 7, "$500K+": 4 },
    priorityFit: { Performance: 6, Cost: 9, Scalability: 7, Simplicity: 8 },
    industryBonus: { Healthcare: 2, Education: 1 },
  },
  {
    id: "pp-dd9900",
    name: "PowerProtect DD9900",
    category: "Data Protection",
    tagline: "Enterprise data domain — petabyte-scale cyber resilience",
    justification: "PowerProtect DD9900 is the enterprise-grade data protection platform. With up to 1.5PB usable capacity, cyber vault integration, and cross-domain replication, it secures your most critical assets at scale.",
    priceHint: "$80–200K per appliance",
    workloadFit: { Virtualization: 7, Database: 9, VDI: 6, "Mixed/HCI": 7, "AI/ML": 6 },
    budgetFit: { "<$50K": 2, "$50–150K": 5, "$150–500K": 9, "$500K+": 10 },
    priorityFit: { Performance: 9, Cost: 4, Scalability: 9, Simplicity: 6 },
    industryBonus: { "Financial Services": 3, Healthcare: 2 },
  },
];

// ── Hybrid Cloud ─────────────────────────────────────────
const hybridCloud: DellProduct[] = [
  {
    id: "apex-vmware",
    name: "APEX Cloud Platform for VMware",
    category: "Hybrid Cloud",
    tagline: "Consistent VMware experience on-prem and in cloud",
    justification: "APEX Cloud Platform extends your VMware environment to cloud with consistent operations. It eliminates the operational gap between on-prem and cloud — VMs move freely without re-architecting.",
    priceHint: "Subscription-based from $3K/mo",
    workloadFit: { Virtualization: 9, Database: 5, VDI: 8, "Mixed/HCI": 9, "AI/ML": 4 },
    budgetFit: { "<$50K": 5, "$50–150K": 7, "$150–500K": 8, "$500K+": 8 },
    priorityFit: { Performance: 6, Cost: 7, Scalability: 9, Simplicity: 10 },
    industryBonus: { Healthcare: 1, Education: 1, Technology: 1 },
  },
  {
    id: "apex-private",
    name: "APEX Private Cloud",
    category: "Hybrid Cloud",
    tagline: "Cloud-native platform with Kubernetes built-in",
    justification: "APEX Private Cloud delivers containerized and cloud-native workloads on Dell infrastructure with built-in Kubernetes orchestration. Perfect for organizations modernizing their application portfolio.",
    priceHint: "Subscription-based from $5K/mo",
    workloadFit: { Virtualization: 6, Database: 5, VDI: 4, "Mixed/HCI": 8, "AI/ML": 7 },
    budgetFit: { "<$50K": 3, "$50–150K": 6, "$150–500K": 8, "$500K+": 9 },
    priorityFit: { Performance: 7, Cost: 6, Scalability: 10, Simplicity: 8 },
    industryBonus: { Technology: 2, Manufacturing: 1 },
  },
  {
    id: "apex-storage",
    name: "APEX Data Storage Services",
    category: "Hybrid Cloud",
    tagline: "Storage-as-a-Service — pay for what you use",
    justification: "APEX Data Storage converts your storage into a consumption model. No upfront capex, elastic scaling, and Dell manages the lifecycle. Ideal when budget flexibility matters more than ownership.",
    priceHint: "Consumption-based from $1.5K/mo",
    workloadFit: { Virtualization: 6, Database: 6, VDI: 5, "Mixed/HCI": 7, "AI/ML": 5 },
    budgetFit: { "<$50K": 8, "$50–150K": 8, "$150–500K": 6, "$500K+": 5 },
    priorityFit: { Performance: 5, Cost: 10, Scalability: 9, Simplicity: 9 },
    industryBonus: { Education: 2, Retail: 2 },
  },
];

// ── Services ─────────────────────────────────────────────
const services: DellProduct[] = [
  {
    id: "prosupport",
    name: "ProSupport",
    category: "Services",
    tagline: "24/7 hardware & software support with 4hr onsite",
    justification: "ProSupport provides 24×7 access to Dell experts, 4-hour onsite hardware response, and proactive monitoring via SupportAssist. The baseline every production deployment should include.",
    priceHint: "$2–5K/yr per device",
    workloadFit: { Virtualization: 7, Database: 7, VDI: 7, "Mixed/HCI": 7, "AI/ML": 7 },
    budgetFit: { "<$50K": 9, "$50–150K": 9, "$150–500K": 7, "$500K+": 5 },
    priorityFit: { Performance: 5, Cost: 9, Scalability: 6, Simplicity: 8 },
    industryBonus: {},
  },
  {
    id: "prosupport-plus",
    name: "ProSupport Plus",
    category: "Services",
    tagline: "Enterprise-grade support with dedicated Technical Account Manager",
    justification: "ProSupport Plus adds a dedicated Technical Account Manager, proactive predictive alerts, and priority escalation. For mission-critical environments, this is the support tier that prevents outages before they happen.",
    priceHint: "$5–12K/yr per device",
    workloadFit: { Virtualization: 7, Database: 9, VDI: 6, "Mixed/HCI": 7, "AI/ML": 8 },
    budgetFit: { "<$50K": 4, "$50–150K": 6, "$150–500K": 9, "$500K+": 10 },
    priorityFit: { Performance: 9, Cost: 4, Scalability: 7, Simplicity: 8 },
    industryBonus: { "Financial Services": 2, Healthcare: 2 },
  },
  {
    id: "prodeploy",
    name: "ProDeploy Enterprise Suite",
    category: "Services",
    tagline: "Expert deployment with knowledge transfer",
    justification: "ProDeploy ensures your Dell infrastructure is installed, configured, and validated by certified engineers. Includes knowledge transfer so your team is operational from day one — no learning curve.",
    priceHint: "$8–25K per engagement",
    workloadFit: { Virtualization: 7, Database: 8, VDI: 7, "Mixed/HCI": 8, "AI/ML": 8 },
    budgetFit: { "<$50K": 5, "$50–150K": 7, "$150–500K": 8, "$500K+": 8 },
    priorityFit: { Performance: 7, Cost: 6, Scalability: 6, Simplicity: 10 },
    industryBonus: {},
  },
];

export const ALL_PRODUCTS: DellProduct[] = [
  ...compute,
  ...storage,
  ...dataProtection,
  ...hybridCloud,
  ...services,
];

export const PRODUCT_CATEGORIES = ["Compute", "Storage", "Data Protection", "Hybrid Cloud", "Services"] as const;

// ── Industry-Specific Talking Points ─────────────────────
export const INDUSTRY_TALKING_POINTS: Record<Industry, string[]> = {
  Healthcare: [
    "HIPAA compliance is non-negotiable — emphasize PowerProtect's immutable backup copies and air-gap capabilities.",
    "PACS and EHR workloads demand low-latency storage — position PowerStore 5200T for clinical systems.",
    "Mention Dell's healthcare reference architectures for Epic, Cerner, and Meditech.",
  ],
  "Financial Services": [
    "Regulatory requirements (SOX, PCI-DSS) make PowerMax's SRDF replication and 6-nines availability compelling.",
    "Position ProSupport Plus with TAM — financial firms need a named escalation path for trading systems.",
    "APEX consumption model aligns well with OpEx preferences of finance departments.",
  ],
  Manufacturing: [
    "Edge AI for quality control and predictive maintenance — XE9680 with PowerScale is the winning combo.",
    "VxRail simplifies plant-floor IT for OT teams with limited infrastructure staff.",
    "Mention Dell's rugged and edge-optimized offerings for factory environments.",
  ],
  Education: [
    "Budget constraints are real — lead with PowerStore 1200T and VxRail E-series for best cost/density.",
    "APEX Data Storage Services eliminates capex hurdles — perfect for grant-funded research.",
    "VDI with VxRail is the standard for campus labs and remote learning infrastructure.",
  ],
  Retail: [
    "Seasonal scaling is key — position APEX Cloud Platform for burst-to-cloud during peak shopping.",
    "POS and inventory databases need reliability — PowerStore 5200T with ProSupport Plus.",
    "Emphasize simplicity of management — retail IT teams are typically lean.",
  ],
  Technology: [
    "DevOps teams want Kubernetes-native — lead with APEX Private Cloud and PowerFlex.",
    "AI/ML workloads are the growth vector — XE9680 + PowerScale F710 is the training pipeline.",
    "Tech companies understand TCO — lean into consumption models and automation ROI.",
  ],
};

// ── Customer Scenario Presets ────────────────────────────
export interface CustomerScenario {
  name: string;
  industry: Industry;
  workload: WorkloadType;
  budget: BudgetTier;
  priorities: Priorities;
}

export const CUSTOMER_SCENARIOS: Record<string, CustomerScenario> = {
  "Regional Hospital — PACS": {
    name: "Regional Hospital — PACS Modernization",
    industry: "Healthcare",
    workload: "Mixed/HCI",
    budget: "$50–150K",
    priorities: { performance: 60, cost: 70, scalability: 80, simplicity: 90 },
  },
  "Mid-size Bank — Core Banking": {
    name: "Mid-size Bank — Core Banking Refresh",
    industry: "Financial Services",
    workload: "Database",
    budget: "$150–500K",
    priorities: { performance: 95, cost: 40, scalability: 60, simplicity: 50 },
  },
  "Manufacturer — Edge AI": {
    name: "Manufacturer — Edge AI for Quality Control",
    industry: "Manufacturing",
    workload: "AI/ML",
    budget: "$150–500K",
    priorities: { performance: 90, cost: 50, scalability: 70, simplicity: 60 },
  },
  "University — Research HPC": {
    name: "University — Research Computing Cluster",
    industry: "Education",
    workload: "AI/ML",
    budget: "$50–150K",
    priorities: { performance: 80, cost: 90, scalability: 85, simplicity: 70 },
  },
  "Retail Chain — Store Refresh": {
    name: "Retail Chain — In-Store Infrastructure Refresh",
    industry: "Retail",
    workload: "Virtualization",
    budget: "$50–150K",
    priorities: { performance: 50, cost: 85, scalability: 75, simplicity: 90 },
  },
  "Startup — AI Platform": {
    name: "Tech Startup — AI Training Platform",
    industry: "Technology",
    workload: "AI/ML",
    budget: "$500K+",
    priorities: { performance: 100, cost: 30, scalability: 95, simplicity: 60 },
  },
};
