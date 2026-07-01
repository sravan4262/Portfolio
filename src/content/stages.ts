// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for the portfolio pipeline.
// Both Fun and Boring modes render from this file.
// ─────────────────────────────────────────────────────────────────────────────

export type Tech = { name: string; why: string };

export type SkillGroup = { category: string; items: string[] };

export type Stage = {
  id: string;
  type: "init" | "education" | "job" | "project" | "skills" | "cleanup";
  segment: "pre" | "parallel" | "post"; // graph position
  label: string; // node title
  sublabel?: string; // role / one-line context
  stageTag: string; // pipeline verb, e.g. "deploy v1"
  years?: string; // short range shown on the node, e.g. "2018–25"
  dates?: string; // full range for the log header
  location?: string;
  status: "success" | "live" | "in-progress";
  summary: string; // concise, scannable (boring logs)
  about: string; // fuller text (kept for SEO / reference)
  tech?: Tech[]; // stack + why
  highlights?: string[]; // recruiter-scannable wins — impact first, quantified
  skillGroups?: SkillGroup[]; // only for the skills stage
  links?: { label: string; url: string }[];
  fun: {
    script: string; // playful blurb + audio script
    audioUrl: string; // /audio/xxx.mp3
    transcript: string; // == script (a11y)
  };
};

export const profile = {
  name: "Sravan Ravula",
  title: "Senior Cloud Engineer · Full-Stack Developer · Generative AI & DevOps",
  location: "Fort Lauderdale, FL",
  experience: "9 yrs",
  phone: "908-420-0323",
  email: "kumar.ravulaa@gmail.com",
  headshot: "/headshot.jpg",
  greeting:
    "Hi, I'm Sravan — a software developer who ships full-stack products across cloud, .NET, and AI. 9 years in, two live apps of my own, and a co-founder along the way.",
  links: {
    linkedin: "https://linkedin.com/in/sravanravula",
    github: "https://github.com/sravan4262",
  },
  summary:
    "Senior software engineer with 9 years across full-stack .NET development and multi-cloud platform engineering (Azure, AWS, GCP). At Citrix, I build FedRAMP High–compliant cloud infrastructure, cut costs through automation, and apply LLMs to security and operations workflows. I ship production systems end to end and have solo-built two live apps, including Byte AI (50+ daily users), and co-founded TrueSpend.",
  resumeUrl: "/resume.pdf",

  // recruiter snapshot
  openTo:
    "Senior Cloud · Full-Stack · Generative-AI · Platform/DevOps roles — remote, or on-site in Fort Lauderdale, FL.",
  coreStack: [
    "C# / .NET 8–9",
    "Azure · AWS · GCP",
    "Kubernetes · Terraform",
    "React · Next.js · Angular",
    "Azure OpenAI · pgvector",
    "SQL Server · PostgreSQL",
  ],
  metrics: [
    { value: "9 yrs", label: "shipping production software" },
    { value: "FedRAMP High", label: "cloud infra at Citrix today" },
    { value: "3 clouds", label: "Azure · AWS · GCP, in prod" },
    { value: "2 live apps", label: "solo-built · +1 co-founded" },
    { value: "~$25K/yr", label: "infra cost cut (VMs → K8s)" },
    { value: "2×+ faster", label: "search rebuilt on Azure AI" },
  ],
};

const fun = (s: string) => ({ script: s, transcript: s });

export const stages: Stage[] = [
  // ⓪ init
  {
    id: "init",
    type: "init",
    segment: "pre",
    label: "init",
    sublabel: "checkout & setup",
    stageTag: "checkout",
    status: "success",
    summary:
      "Senior full-stack + cloud engineer, 9 years in, based in Fort Lauderdale, FL. Two live apps of my own, one co-founded. Here's the whole run.",
    about:
      "Pipeline initialization — spinning up the runner and checking out the candidate before the build stages run.",
    fun: {
      ...fun(
        "Runner's up. Nine years of experience, two live apps, and the audacity to deploy on a Friday. Let's go."
      ),
      audioUrl: "/audio/init.m4a",
    },
  },

  // ① Education
  {
    id: "education",
    type: "education",
    segment: "pre",
    label: "Education",
    sublabel: "M.S. Electrical Eng · B.S. Electronics",
    stageTag: "build / compile",
    years: "2011–16",
    dates: "2011 – 2016",
    location: "UMKC · KL University",
    status: "success",
    summary:
      "Started in electrical engineering, ended up in software — the systems-and-math foundation stuck around.",
    highlights: [
      "M.S. Electrical Engineering — University of Missouri–Kansas City",
      "B.S. Electronics — KL University",
      "Hardware-to-software jump that still shapes how I debug systems",
    ],
    about:
      "Started in electrical/electronics engineering, then moved into software — a systems and math foundation that carried into cloud and backend work. M.S. EE, University of Missouri–Kansas City (2015–16); B.S. Electronics, KL University (2011–15).",
    tech: [
      { name: "EE / Electronics", why: "Systems thinking + math foundation" },
      { name: "Signals & Computation", why: "Bridge from hardware into software" },
    ],
    fun: {
      ...fun(
        "I studied in electrical engineering — until I realized you can't Ctrl-Z a soldering iron. So I switched to software."
      ),
      audioUrl: "/audio/education.m4a",
    },
  },

  // ② Accenture
  {
    id: "accenture",
    type: "job",
    segment: "pre",
    label: "Accenture",
    sublabel: "Full-Stack .NET Developer · gov healthcare claims",
    stageTag: "deploy v1",
    years: "2017",
    dates: "Jan 2017 – Dec 2017",
    location: "Washington, DC",
    status: "success",
    summary:
      "Cut my teeth on federal healthcare claims — distributed services, internal desktop tooling, and a database I made a lot faster.",
    highlights: [
      "Tuned SQL Server stored procedures — 75% faster",
      "Shipped distributed WCF/SOAP services for HMS medical-claims review",
      "Let analysts edit claim rules live via InRule — zero redeploys",
    ],
    about:
      "Built distributed services and internal desktop tools for government healthcare claims processing (HMS medical-claims review); optimized SQL Server stored procedures by 75%.",
    tech: [
      { name: "C# / .NET", why: "Enterprise standard" },
      { name: "WCF / SOAP", why: "Contract-based reliable service comms" },
      { name: "WPF + MVVM", why: "Clean internal desktop apps" },
      { name: "SQL Server", why: "Relational data + stored-proc tuning" },
      { name: "InRule", why: "Analysts change claim rules without redeploys" },
    ],
    fun: {
      ...fun(
        "First real job: government healthcare claims — enough XML to gift-wrap the whole planet. Made the database faster anyway."
      ),
      audioUrl: "/audio/accenture.m4a",
    },
  },

  // ③ UPMC
  {
    id: "upmc",
    type: "job",
    segment: "pre",
    label: "UPMC Health Plan",
    sublabel: "Senior .NET Developer · member platform",
    stageTag: "deploy v2",
    years: "2018–25",
    dates: "Jan 2018 – Sep 2025",
    location: "Pittsburgh, PA",
    status: "success",
    summary:
      "Seven years as the go-to engineer on a healthcare member platform — APIs, front-ends, and the search rebuild everyone felt.",
    highlights: [
      "Led on-prem → Azure AI Search migration — 2×+ faster",
      "Shipped Azure OpenAI natural-language search across 40+ filters",
      "Cut CI/CD deploy time 40% on Azure DevOps",
      "7 yrs scaling .NET 8 APIs + Angular/React UIs for members",
    ],
    about:
      "Seven years building scalable .NET APIs and front-ends for a healthcare member platform. Led an on-prem → Azure AI Search migration (>100% faster) and integrated Azure OpenAI for natural-language queries.",
    tech: [
      { name: ".NET 8 / ASP.NET Core", why: "High-performance APIs" },
      { name: "Azure AI Search", why: "Replaced slow on-prem search; >100% faster" },
      { name: "Azure OpenAI", why: "Plain-English queries over 40 filters" },
      { name: "Angular / React / Redux", why: "Rich member UIs, predictable state" },
      { name: "Redis", why: "Cache hot data" },
      { name: "NServiceBus / RabbitMQ", why: "Reliable async messaging" },
      { name: "SQL Server / Cosmos DB", why: "Relational + distributed data" },
      { name: "Azure DevOps CI/CD", why: "Cut deploy time 40%" },
    ],
    fun: {
      ...fun(
        "Seven years here at UPMC. Found a search so slow it qualified as a coffee break — if you know what I mean. Rebuilt it on Azure, double the speed."
      ),
      audioUrl: "/audio/upmc.m4a",
    },
  },

  // ④ Citrix
  {
    id: "citrix",
    type: "job",
    segment: "pre",
    label: "Citrix",
    sublabel: "Senior Cloud Engineer · FedRAMP High",
    stageTag: "running in prod",
    years: "2025–now",
    dates: "Oct 2025 – Present",
    location: "Fort Lauderdale, FL",
    status: "live",
    summary:
      "Where I am now — building multi-cloud, FedRAMP High infrastructure, and teaching LLMs to do the security busywork.",
    highlights: [
      "Cut ~$25K/yr by moving workloads from VMs → Kubernetes",
      "Automated policy & operations — 90%+ less manual toil",
      "Built AI security-triage that auto-files Jira tickets",
      "Multi-cloud (Azure/AWS/GCP) infra to FedRAMP High standards",
    ],
    about:
      "Multi-cloud (Azure / AWS / GCP) infrastructure for FedRAMP High systems. Drove cost optimization (VMs → Kubernetes, ~$25K/yr), automated policy + operations (>90% less manual work), and built AI tooling for security triage and incident summarization.",
    tech: [
      { name: "Azure / AWS / GCP", why: "Multi-cloud platform engineering" },
      { name: "Kubernetes", why: "Cost + scaling over VMs" },
      { name: "Terraform", why: "Auditable infra for FedRAMP" },
      { name: "C# / PowerShell", why: "Azure automation" },
      { name: "Azure OpenAI", why: "Vuln triage → auto-Jira; ops summaries" },
      { name: "Splunk Cloud (HEC)", why: "Push-based telemetry" },
    ],
    fun: {
      ...fun(
        "Right now: three clouds, FedRAMP High, security on hard mode. I taught an AI to file the Jira tickets, so I don't have to."
      ),
      audioUrl: "/audio/citrix.m4a",
    },
  },

  // ⑤ Byte AI — parallel
  {
    id: "byteai",
    type: "project",
    segment: "parallel",
    label: "Byte AI",
    sublabel: "Solo · dev social platform",
    stageTag: "parallel deploy",
    years: "live · ~50 DAU",
    location: "iOS + Web",
    status: "live",
    summary:
      "My indie app — a social platform for developers, built end to end by one person (me) and live with real daily users.",
    highlights: [
      "Solo-built the whole stack: .NET backend, Next.js web, native SwiftUI iOS",
      "~50 daily active users, live on the App Store",
      "Hybrid semantic search: pgvector + self-hosted ONNX embeddings, fused with RRF",
    ],
    about:
      "A tech-focused social platform built end to end — backend, web, and native iOS — with hybrid semantic search and AI content features. ~50 daily active users.",
    tech: [
      { name: ".NET 9", why: "Core strength" },
      { name: "Next.js / SwiftUI", why: "Web + native iOS" },
      { name: "Supabase / pgvector", why: "Auth, DB, and vectors in one" },
      { name: "ONNX embeddings", why: "Self-hosted, ~free at scale" },
      { name: "Reciprocal Rank Fusion", why: "Blend keyword + semantic search" },
      { name: "Gemini · SignalR · APNs", why: "Tagging, chat, push" },
    ],
    links: [
      { label: "byteaiofficial.com", url: "https://www.byteaiofficial.com" },
      { label: "App Store", url: "https://apps.apple.com/us/app/byteaiofficial/id6764432542" },
    ],
    fun: {
      ...fun(
        "First indie app — a social app for devs. Backend, web, iPhone app, everything, all Solo. Fueled entirely by coffee and beer."
      ),
      audioUrl: "/audio/byteai.m4a",
    },
  },

  // ⑥ Infinity Finances — parallel
  {
    id: "infinity",
    type: "project",
    segment: "parallel",
    label: "Infinity Finances",
    sublabel: "Solo · FIRE planning",
    stageTag: "parallel deploy",
    years: "live",
    location: "Web",
    status: "live",
    summary:
      "A financial-independence planner that answers one scary question: when can you actually stop working?",
    highlights: [
      "Month-by-month Monte-Carlo simulation with tax-optimized withdrawals",
      "AI assistant turns plain-English input into structured financial data",
      "Live in production (Next.js + Hono + Supabase)",
    ],
    about:
      "A financial-independence / retirement (FIRE) planning platform with a month-by-month portfolio simulation engine (Monte Carlo, tax-optimized withdrawals) and an AI assistant for data entry.",
    tech: [
      { name: "Next.js / React", why: "Interactive calculators" },
      { name: "Hono API", why: "Ultra-light TS backend" },
      { name: "Supabase", why: "Persistence / auth" },
      { name: "Gemini", why: "Plain-English → structured inputs" },
    ],
    links: [{ label: "firecalculator-app.vercel.app", url: "https://firecalculator-app.vercel.app" }],
    fun: {
      ...fun(
        "Did you ever feel like you're going broke but not knowing when? Well, feed this app with your data, so I know if you're broke or not — and so do you."
      ),
      audioUrl: "/audio/infinity.m4a",
    },
  },

  // ⑦ TrueSpend — parallel
  {
    id: "truespend",
    type: "project",
    segment: "parallel",
    label: "TrueSpend",
    sublabel: "Co-founder · rewards optimizer",
    stageTag: "parallel deploy",
    years: "in dev · TestFlight",
    location: "iOS + Android",
    status: "in-progress",
    summary:
      "Co-founded startup — a geo-aware app that tells you which card to swipe the moment you walk into a store.",
    highlights: [
      "Co-founder — product + engineering, iOS & Android on one Expo codebase",
      "Real money movement via Plaid + Stripe",
      "Battery-efficient geofencing; nightly Azure OpenAI insights — in TestFlight beta",
    ],
    about:
      "A geo-aware app that recommends the best rewards credit card the moment you arrive at a store. Co-founded; in development on iOS TestFlight.",
    tech: [
      { name: "React Native + Expo", why: "One codebase, iOS + Android" },
      { name: ".NET 9", why: "Backend strength" },
      { name: "Geofencing", why: "Battery-efficient arrival detection" },
      { name: "Plaid / Stripe", why: "Real transactions + billing" },
      { name: "Azure OpenAI (nightly)", why: "Insights without realtime cost" },
    ],
    links: [{ label: "truespend.org", url: "https://www.truespend.org" }],
    fun: {
      ...fun(
        "TrueSpend — I co-founded this. You walk into a store and your phone snitches on your wallet. And also, iOS sometimes kills the battery, as you know. So, does my app."
      ),
      audioUrl: "/audio/truespend.m4a",
    },
  },

  // ⑧ Skills — post
  {
    id: "skills",
    type: "skills",
    segment: "post",
    label: "Skills",
    sublabel: "the full toolbox",
    stageTag: "publish artifacts",
    status: "success",
    summary: "Complete technical skill set, grouped by category.",
    about: "Full technical skill set across languages, frontend, cloud/devops, AI, data, and practices.",
    skillGroups: [
      {
        category: "Languages & Frameworks",
        items: [
          "C#",
          ".NET 8 / 9",
          "ASP.NET Core",
          "Web API",
          "Entity Framework",
          "MediatR",
          "WCF",
          "WPF / MVVM",
          "TypeScript",
          "Node.js",
          "Swift",
        ],
      },
      {
        category: "Frontend & Mobile",
        items: [
          "React",
          "Next.js",
          "Angular",
          "Redux",
          "Tailwind CSS",
          "React Native",
          "Expo",
          "SwiftUI",
          "Zustand",
          "React Query",
        ],
      },
      {
        category: "Cloud & DevOps",
        items: [
          "Azure",
          "AWS",
          "GCP",
          "Docker",
          "Kubernetes / AKS",
          "OpenShift",
          "Terraform",
          "GitHub Actions",
          "Azure DevOps CI/CD",
          "PowerShell",
          "FedRAMP High",
          "SRE / observability",
        ],
      },
      {
        category: "AI & Search",
        items: [
          "Generative AI",
          "Azure OpenAI",
          "Claude",
          "Gemini",
          "prompt engineering",
          "embeddings",
          "vector search (pgvector)",
          "hybrid search",
          "ONNX",
          "Azure AI Search",
          "Solr",
        ],
      },
      {
        category: "Data & Messaging",
        items: [
          "SQL Server",
          "PostgreSQL",
          "Supabase",
          "Cosmos DB",
          "Redis",
          "NServiceBus",
          "RabbitMQ",
          "Splunk",
          "HL7",
        ],
      },
      {
        category: "Integrations & Practices",
        items: [
          "Plaid",
          "Stripe",
          "SignalR",
          "REST / SOAP",
          "OAuth / OIDC",
          "Microservices",
          "xUnit / Vitest / Playwright",
          "TDD",
          "Agile / Scrum / SAFe",
        ],
      },
    ],
    fun: {
      ...fun(
        "The whole toolbox — languages, frameworks, cloud, AI, databases, blah blah blah. I'm pretty good at everything. At least I like to think so."
      ),
      audioUrl: "/audio/skills.m4a",
    },
  },

  // ⑨ cleanup — post
  {
    id: "cleanup",
    type: "cleanup",
    segment: "post",
    label: "cleanup",
    sublabel: "let's talk",
    stageTag: "the wrap",
    status: "success",
    summary:
      "That's the whole run — nothing broke, nobody got paged. I'm open to senior cloud, full-stack, and GenAI roles.",
    about:
      "Pipeline complete. Artifacts cached, status green. Open to senior cloud, full-stack, and generative-AI roles — let's talk.",
    links: [
      { label: "Email", url: "mailto:kumar.ravulaa@gmail.com" },
      { label: "GitHub", url: "https://github.com/sravan4262" },
      { label: "LinkedIn", url: "https://linkedin.com/in/sravanravula" },
    ],
    fun: {
      ...fun(
        "Thanks for wasting your time on my pipeline run — there's nothing better you could do, right? Hey, at least everything's green, zero rollbacks, nobody got paged. If you liked the build, just hire me."
      ),
      audioUrl: "/audio/cleanup.m4a",
    },
  },
];

export const preStages = stages.filter((s) => s.segment === "pre");
export const parallelStages = stages.filter((s) => s.segment === "parallel");
export const postStages = stages.filter((s) => s.segment === "post");
