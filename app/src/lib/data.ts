// ═══════════════════════════════════════════════════════════════════
// MERIDIAN — Simulated Intelligence Data
// Realistic Iraq/MENA OSINT data for platform demonstration
// ═══════════════════════════════════════════════════════════════════

import type {
  STIScore,
  Event,
  Actor,
  GovernorateSTI,
  TimeSeriesPoint,
  ModuleInfo,
  ConflictForecast,
  DisplacementPrediction,
  ScenarioModel,
  Report,
  SatTemplate,
  EvidenceItem,
  PlatformStat,
  Narrative,
  CoordinatedCampaign,
  MediaCredibility,
  EconomicIndicator,
  EnergySectorData,
  InvestmentRisk,
  TradeFlow,
} from "./types";

// ── STI Current Score ───────────────────────────────────────────────
export const currentSTI: STIScore = {
  composite: 65,
  previousComposite: 62,
  status: "HIGH",
  confidence: 0.87,
  lastUpdated: "2026-04-10T19:00:00Z",
  trend: "up",
  axes: [
    {
      id: "sunni-shia",
      name: "Sunni-Shia",
      nameAr: "سني-شيعي",
      score: 72,
      previousScore: 68,
      weight: 0.25,
      signals: 847,
      trend: "up",
      color: "#C13A1B",
    },
    {
      id: "arab-kurd-turkmen",
      name: "Arab-Kurd-Turkmen",
      nameAr: "عربي-كردي-تركماني",
      score: 64,
      previousScore: 59,
      weight: 0.22,
      signals: 741,
      trend: "up",
      color: "#D47B2A",
    },
    {
      id: "intra-shia",
      name: "Intra-Shia",
      nameAr: "داخل الشيعة",
      score: 45,
      previousScore: 43,
      weight: 0.18,
      signals: 512,
      trend: "up",
      color: "#C9A84C",
    },
    {
      id: "kdp-puk",
      name: "KDP-PUK",
      nameAr: "پارتی-یەکێتی",
      score: 61,
      previousScore: 58,
      weight: 0.15,
      signals: 389,
      trend: "up",
      color: "#D47B2A",
    },
    {
      id: "tribal",
      name: "Tribal",
      nameAr: "عشائري",
      score: 38,
      previousScore: 40,
      weight: 0.1,
      signals: 234,
      trend: "down",
      color: "#5B9B3E",
    },
    {
      id: "minority",
      name: "Ethno-Religious Minorities",
      nameAr: "الأقليات العرقية والدينية",
      score: 46,
      previousScore: 44,
      weight: 0.1,
      signals: 256,
      trend: "up",
      color: "#C9A84C",
    },
  ],
};

// ── STI Historical Data (30 days) ───────────────────────────────────
export const stiTimeSeries: TimeSeriesPoint[] = Array.from(
  { length: 30 },
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const base = 55;
    const noise = Math.sin(i * 0.5) * 8 + Math.random() * 6;
    const trend = i * 0.3;
    return {
      timestamp: date.toISOString().split("T")[0],
      value: Math.min(100, Math.max(0, Math.round(base + noise + trend))),
    };
  }
);

// ── Governorate STI Scores ──────────────────────────────────────────
export const governorateScores: GovernorateSTI[] = [
  { id: "bg", name: "Baghdad", nameAr: "بغداد", score: 71, status: "HIGH", trend: "up", topAxis: "Sunni-Shia" },
  { id: "bs", name: "Basra", nameAr: "البصرة", score: 48, status: "ELEVATED", trend: "stable", topAxis: "Intra-Shia" },
  { id: "nn", name: "Nineveh", nameAr: "نينوى", score: 64, status: "HIGH", trend: "up", topAxis: "Arab-Kurd-Turkmen" },
  { id: "er", name: "Erbil", nameAr: "أربيل", score: 55, status: "ELEVATED", trend: "stable", topAxis: "KDP-PUK" },
  { id: "su", name: "Sulaymaniyah", nameAr: "السليمانية", score: 52, status: "ELEVATED", trend: "down", topAxis: "KDP-PUK" },
  { id: "kk", name: "Kirkuk", nameAr: "كركوك", score: 82, status: "CRITICAL", trend: "up", topAxis: "Arab-Kurd-Turkmen" },
  { id: "tz", name: "Tuz Khurmatu", nameAr: "طوزخورماتو", score: 76, status: "HIGH", trend: "up", topAxis: "Arab-Kurd-Turkmen" },
  { id: "dy", name: "Diyala", nameAr: "ديالى", score: 73, status: "HIGH", trend: "up", topAxis: "Sunni-Shia" },
  { id: "sd", name: "Salahuddin", nameAr: "صلاح الدين", score: 60, status: "ELEVATED", trend: "up", topAxis: "Arab-Kurd-Turkmen" },
  { id: "an", name: "Anbar", nameAr: "الأنبار", score: 45, status: "ELEVATED", trend: "down", topAxis: "Tribal" },
  { id: "bbl", name: "Babylon", nameAr: "بابل", score: 35, status: "LOW", trend: "stable", topAxis: "Intra-Shia" },
  { id: "kr", name: "Karbala", nameAr: "كربلاء", score: 28, status: "LOW", trend: "down", topAxis: "Intra-Shia" },
  { id: "nj", name: "Najaf", nameAr: "النجف", score: 32, status: "LOW", trend: "stable", topAxis: "Intra-Shia" },
  { id: "ws", name: "Wasit", nameAr: "واسط", score: 38, status: "LOW", trend: "stable", topAxis: "Tribal" },
  { id: "my", name: "Maysan", nameAr: "ميسان", score: 42, status: "ELEVATED", trend: "up", topAxis: "Tribal" },
  { id: "dq", name: "Dhi Qar", nameAr: "ذي قار", score: 50, status: "ELEVATED", trend: "up", topAxis: "Intra-Shia" },
  { id: "mu", name: "Muthanna", nameAr: "المثنى", score: 22, status: "LOW", trend: "stable", topAxis: "Tribal" },
  { id: "qd", name: "Qadisiyyah", nameAr: "القادسية", score: 30, status: "LOW", trend: "down", topAxis: "Tribal" },
  { id: "dh", name: "Duhok", nameAr: "دهوك", score: 44, status: "ELEVATED", trend: "stable", topAxis: "KDP-PUK" },
  { id: "ha", name: "Halabja", nameAr: "حلبجة", score: 36, status: "LOW", trend: "down", topAxis: "KDP-PUK" },
];

// ── Real-Time Events Feed ───────────────────────────────────────────
export const recentEvents: Event[] = [
  {
    id: "evt-001",
    title: "PMF Faction Issues Warning Over Budget Allocation Dispute",
    titleAr: "فصيل في الحشد الشعبي يصدر تحذيراً بشأن خلاف تخصيصات الميزانية",
    type: "political",
    severity: "high",
    location: "Baghdad, Green Zone",
    governorate: "Baghdad",
    country: "Iraq",
    timestamp: "2026-04-10T18:45:00Z",
    source: "Al Sumaria News",
    language: "Arabic",
    sentiment: -0.72,
    stiRelevance: true,
    stiAxes: ["sunni-shia", "intra-shia"],
    summary:
      "A major PMF political faction released a statement warning of 'consequences' if Sunni-majority governorates receive disproportionate reconstruction funds in the 2026 supplementary budget.",
    entities: ["PMF", "Iraqi Parliament", "Budget Committee"],
    verified: true,
  },
  {
    id: "evt-002",
    title: "Peshmerga-ISF Checkpoint Standoff in Disputed Area Near Makhmur",
    titleAr: "مواجهة بين البيشمركة والقوات الأمنية عند نقطة تفتيش في منطقة متنازع عليها قرب مخمور",
    type: "security",
    severity: "critical",
    location: "Makhmur District, Erbil-Nineveh",
    governorate: "Nineveh",
    country: "Iraq",
    timestamp: "2026-04-10T17:30:00Z",
    source: "Rudaw Media Network",
    language: "Kurdish",
    sentiment: -0.85,
    stiRelevance: true,
    stiAxes: ["arab-kurd-turkmen"],
    summary:
      "Peshmerga forces and Iraqi Security Forces engaged in a tense standoff at a checkpoint near Makhmur after ISF attempted to establish a new position in a KRG-administered area. Turkmen community leaders in nearby Tuz Khurmatu expressed alarm at the escalation.",
    entities: ["Peshmerga", "Iraqi Security Forces", "Makhmur", "Iraqi Turkmen Front"],
    verified: true,
  },
  {
    id: "evt-003",
    title: "Sadrist Movement Announces Mass Rally in Najaf",
    titleAr: "التيار الصدري يعلن عن تظاهرة حاشدة في النجف",
    type: "political",
    severity: "high",
    location: "Najaf City",
    governorate: "Najaf",
    country: "Iraq",
    timestamp: "2026-04-10T16:15:00Z",
    source: "Al Jazeera Arabic",
    language: "Arabic",
    sentiment: -0.45,
    stiRelevance: true,
    stiAxes: ["intra-shia"],
    summary:
      "Muqtada al-Sadr's movement announced plans for a mass demonstration in Najaf demanding government reform and opposing Coordination Framework influence.",
    entities: ["Sadrist Movement", "Muqtada al-Sadr", "Coordination Framework"],
    verified: true,
  },
  {
    id: "evt-004",
    title: "KDP-PUK Negotiations Over Revenue Sharing Break Down",
    titleAr: "فشل مفاوضات الحزب الديمقراطي والاتحاد الوطني حول تقاسم الإيرادات",
    type: "political",
    severity: "high",
    location: "Erbil, KRG Parliament",
    governorate: "Erbil",
    country: "Iraq",
    timestamp: "2026-04-10T15:00:00Z",
    source: "NRT Digital Media",
    language: "Kurdish",
    sentiment: -0.68,
    stiRelevance: true,
    stiAxes: ["kdp-puk"],
    summary:
      "Revenue sharing talks between KDP and PUK collapsed after disagreements over customs revenue distribution at Ibrahim Khalil and Haji Omaran border crossings.",
    entities: ["KDP", "PUK", "KRG Parliament"],
    verified: true,
  },
  {
    id: "evt-005",
    title: "Drought Triggers Displacement in Southern Marshlands",
    titleAr: "الجفاف يؤدي إلى نزوح في الأهوار الجنوبية",
    type: "climate",
    severity: "medium",
    location: "Central Marshes, Dhi Qar",
    governorate: "Dhi Qar",
    country: "Iraq",
    timestamp: "2026-04-10T14:00:00Z",
    source: "OCHA Iraq",
    language: "English",
    sentiment: -0.55,
    stiRelevance: true,
    stiAxes: ["tribal"],
    summary:
      "Over 200 families displaced from marshland villages as water levels reach critical lows. Tribal disputes over remaining water access intensify.",
    entities: ["OCHA", "Dhi Qar Governorate", "Central Marshes"],
    verified: true,
  },
  {
    id: "evt-006",
    title: "Cross-Sectarian Parliamentary Coalition Proposes Electoral Reform",
    titleAr: "تحالف عابر للطوائف في البرلمان يقترح إصلاحاً انتخابياً",
    type: "political",
    severity: "low",
    location: "Baghdad, Parliament",
    governorate: "Baghdad",
    country: "Iraq",
    timestamp: "2026-04-10T12:30:00Z",
    source: "Shafaq News",
    language: "Arabic",
    sentiment: 0.65,
    stiRelevance: true,
    stiAxes: ["sunni-shia"],
    summary:
      "A cross-sectarian coalition of 78 MPs proposed a new electoral law emphasizing individual candidacy over party lists, seen as a challenge to muhassasa.",
    entities: ["Iraqi Parliament", "Electoral Commission"],
    verified: true,
  },
  {
    id: "evt-007",
    title: "IRGC-Aligned Media Escalates Anti-US Rhetoric in Iraq",
    titleAr: "إعلام مرتبط بالحرس الثوري يصعّد الخطاب المعادي لأمريكا في العراق",
    type: "security",
    severity: "high",
    location: "Multiple — Baghdad, Basra, Karbala",
    governorate: "Baghdad",
    country: "Iraq",
    timestamp: "2026-04-10T11:00:00Z",
    source: "Telegram OSINT Collection",
    language: "Arabic",
    sentiment: -0.88,
    stiRelevance: true,
    stiAxes: ["sunni-shia", "intra-shia"],
    summary:
      "Coordinated messaging campaign across 14 IRGC-linked Telegram channels calling for 'resistance operations' against foreign presence, coinciding with anniversary of Soleimani assassination.",
    entities: ["IRGC", "Kata'ib Hezbollah", "Asa'ib Ahl al-Haq"],
    verified: false,
  },
  {
    id: "evt-008",
    title: "Yazidi Community Leaders Demand Security Guarantees for Sinjar Return",
    titleAr: "قيادات إيزيدية تطالب بضمانات أمنية للعودة إلى سنجار",
    type: "social",
    severity: "medium",
    location: "Sinjar District",
    governorate: "Nineveh",
    country: "Iraq",
    timestamp: "2026-04-10T09:30:00Z",
    source: "Rudaw Media Network",
    language: "Kurdish",
    sentiment: -0.35,
    stiRelevance: true,
    stiAxes: ["minority"],
    summary:
      "Yazidi community leaders issued a joint statement conditioning large-scale return to Sinjar on the withdrawal of competing militia forces and implementation of the Sinjar Agreement.",
    entities: ["Yazidi Community", "Sinjar District", "YBS", "PKK"],
    verified: true,
  },
  {
    id: "evt-009",
    title: "Turkmen Properties Seized in Kirkuk as Demographic Tensions Escalate",
    titleAr: "مصادرة ممتلكات تركمانية في كركوك مع تصاعد التوترات الديموغرافية",
    type: "political",
    severity: "critical",
    location: "Kirkuk City, Southern Districts",
    governorate: "Kirkuk",
    country: "Iraq",
    timestamp: "2026-04-10T08:00:00Z",
    source: "Turkmeneli TV",
    language: "Arabic",
    sentiment: -0.91,
    stiRelevance: true,
    stiAxes: ["arab-kurd-turkmen", "minority"],
    summary:
      "Iraqi Turkmen Front reports 23 Turkmen-owned properties in southern Kirkuk illegally transferred to non-Turkmen owners, describing it as systematic demographic engineering. The ITF called on Baghdad to enforce Article 140 protections and warned of an emerging property crisis that threatens the fragile tri-ethnic balance in Kirkuk governorate.",
    entities: ["Iraqi Turkmen Front", "Kirkuk Governorate", "Article 140 Committee", "Turkmen Community"],
    verified: true,
  },
  {
    id: "evt-010",
    title: "Shabak Community Protests Militia Presence Near Mosul",
    titleAr: "مجتمع الشبك يحتج على وجود ميليشيات قرب الموصل",
    type: "social",
    severity: "medium",
    location: "Bartella, Nineveh Plains",
    governorate: "Nineveh",
    country: "Iraq",
    timestamp: "2026-04-10T07:15:00Z",
    source: "Al Sumaria News",
    language: "Arabic",
    sentiment: -0.62,
    stiRelevance: true,
    stiAxes: ["minority"],
    summary:
      "Hundreds of Shabak community members demonstrated in Bartella against continued PMF Shabak Brigade presence, demanding integration into federal security forces and an end to checkpoint taxation. Assyrian Christian leaders in adjacent Qaraqosh expressed solidarity.",
    entities: ["Shabak Community", "PMF 30th Brigade", "Bartella", "Assyrian Church of the East"],
    verified: true,
  },
  {
    id: "evt-011",
    title: "Mandaean Community Reports Targeted Harassment in Basra",
    titleAr: "الطائفة المندائية تبلغ عن مضايقات مستهدفة في البصرة",
    type: "social",
    severity: "medium",
    location: "Basra City, Old Quarter",
    governorate: "Basra",
    country: "Iraq",
    timestamp: "2026-04-10T06:00:00Z",
    source: "Mandaean Human Rights Group",
    language: "Arabic",
    sentiment: -0.58,
    stiRelevance: true,
    stiAxes: ["minority"],
    summary:
      "Sabean-Mandaean community leaders reported a surge in targeted business closures and threats against gold workshops in Basra's old quarter, calling it part of a broader pattern of religious minority displacement from southern Iraq.",
    entities: ["Mandaean Community", "Basra Governorate", "Sabean-Mandaean Council"],
    verified: true,
  },
];

// ── Actor Database ──────────────────────────────────────────────────
export const actors: Actor[] = [
  {
    id: "act-001",
    name: "Kata'ib Hezbollah",
    nameAr: "كتائب حزب الله",
    type: "militia",
    category: "Iran-aligned PMF",
    country: "Iraq",
    affiliation: "Popular Mobilization Forces / IRGC",
    description:
      "One of the most powerful Iran-aligned armed groups in Iraq. US-designated terrorist organization. Operates independently within PMF framework.",
    connections: 47,
    riskLevel: "critical",
    lastActive: "2026-04-10",
  },
  {
    id: "act-002",
    name: "Sadrist Movement",
    nameAr: "التيار الصدري",
    type: "party",
    category: "Political-Military Movement",
    country: "Iraq",
    affiliation: "Independent Shia",
    description:
      "Mass political and religious movement led by Muqtada al-Sadr. Commands millions of followers. Oscillates between government participation and street mobilization.",
    connections: 62,
    riskLevel: "high",
    lastActive: "2026-04-10",
  },
  {
    id: "act-003",
    name: "Kurdistan Democratic Party",
    nameAr: "الحزب الديمقراطي الكردستاني",
    type: "party",
    category: "Kurdish Political Party",
    country: "Iraq",
    affiliation: "KRG / Turkey-aligned",
    description:
      "Dominant party in Erbil and Duhok. Controls KRG presidency and significant Peshmerga forces. Led by the Barzani family.",
    connections: 55,
    riskLevel: "medium",
    lastActive: "2026-04-10",
  },
  {
    id: "act-004",
    name: "Patriotic Union of Kurdistan",
    nameAr: "الاتحاد الوطني الكردستاني",
    type: "party",
    category: "Kurdish Political Party",
    country: "Iraq",
    affiliation: "KRG / Iran-leaning",
    description:
      "Dominant in Sulaymaniyah and Halabja. Controls separate Peshmerga units and intelligence services. Led by the Talabani family.",
    connections: 48,
    riskLevel: "medium",
    lastActive: "2026-04-09",
  },
  {
    id: "act-005",
    name: "Asa'ib Ahl al-Haq",
    nameAr: "عصائب أهل الحق",
    type: "militia",
    category: "Iran-aligned PMF",
    country: "Iraq",
    affiliation: "Popular Mobilization Forces / IRGC / Coordination Framework",
    description:
      "Major Iran-aligned militia led by Qais al-Khazali. Active in politics through Sadiqoun parliamentary bloc. Controls significant territory in mixed Sunni-Shia areas.",
    connections: 41,
    riskLevel: "critical",
    lastActive: "2026-04-10",
  },
  {
    id: "act-006",
    name: "New Generation Movement",
    nameAr: "بزووتنەوەی نەوەی نوێ",
    type: "party",
    category: "Kurdish Opposition",
    country: "Iraq",
    affiliation: "Independent Kurdish",
    description:
      "Opposition party challenging KDP-PUK duopoly. Popular among Kurdish youth. Critical of both traditional parties' corruption and Iranian/Turkish influence.",
    connections: 22,
    riskLevel: "low",
    lastActive: "2026-04-08",
  },
  {
    id: "act-007",
    name: "Iraqi Turkmen Front",
    nameAr: "الجبهة التركمانية العراقية",
    type: "party",
    category: "Turkmen Political Party",
    country: "Iraq",
    affiliation: "Turkey-aligned / Multi-sectarian Turkmen",
    description:
      "Primary political representative of Iraq's Turkmen community — the country's third-largest ethnic group. Active in Kirkuk, Tuz Khurmatu, Tal Afar, and Mosul. Advocates for Turkmen rights in disputed territories and opposes both Arabization and Kurdification policies. Maintains close ties with Ankara.",
    connections: 35,
    riskLevel: "medium",
    lastActive: "2026-04-10",
  },
  {
    id: "act-008",
    name: "Assyrian Democratic Movement",
    nameAr: "الحركة الديمقراطية الآشورية",
    type: "party",
    category: "Assyrian/Christian Political Party",
    country: "Iraq",
    affiliation: "Independent Christian",
    description:
      "Oldest Assyrian political party in Iraq. Represents Assyrian, Chaldean, and Syriac Christian communities. Advocates for autonomous Nineveh Plains region. Active in diaspora advocacy and return facilitation.",
    connections: 18,
    riskLevel: "low",
    lastActive: "2026-04-07",
  },
  {
    id: "act-009",
    name: "Shabak Community Council",
    nameAr: "مجلس مجتمع الشبك",
    type: "organization",
    category: "Ethno-Religious Community Organization",
    country: "Iraq",
    affiliation: "Independent Shabak",
    description:
      "Representative body for the Shabak people, a distinct ethno-religious minority concentrated in villages east of Mosul. Navigates complex identity politics between Kurdish and Arab claims, with both Sunni and Shia Shabak sub-communities. Opposes forced integration into either Kurdish or Arab political frameworks.",
    connections: 12,
    riskLevel: "medium",
    lastActive: "2026-04-10",
  },
];

// ── Platform Modules ────────────────────────────────────────────────
export const modules: ModuleInfo[] = [
  {
    id: "signal",
    name: "SIGNAL",
    icon: "signal",
    description: "Real-time monitoring across 50,000+ sources with sub-60s event detection",
    status: "active",
    features: [
      "Real-time event detection",
      "Custom alert rules",
      "Multi-language feed",
      "Sentiment trending",
      "Breaking event clustering",
    ],
  },
  {
    id: "terrain",
    name: "TERRAIN",
    icon: "terrain",
    description: "Geospatial intelligence with satellite, conflict, infrastructure, and climate overlays",
    status: "active",
    features: [
      "15+ map overlays",
      "Conflict event plotting",
      "Infrastructure monitoring",
      "Satellite change detection",
      "Custom geofencing",
    ],
  },
  {
    id: "nexus",
    name: "NEXUS",
    icon: "nexus",
    description: "Actor and network analysis with 5,000+ entity profiles and relationship mapping",
    status: "active",
    features: [
      "Entity database",
      "Relationship mapping",
      "Financial flow tracking",
      "Network visualization",
      "Org charts",
    ],
  },
  {
    id: "lens",
    name: "LENS",
    icon: "lens",
    description: "Media and narrative analysis across social platforms with disinfo detection",
    status: "beta",
    features: [
      "Social media monitoring",
      "Disinfo detection",
      "Deepfake analysis",
      "Media landscape mapping",
      "Narrative tracking",
    ],
  },
  {
    id: "pulse",
    name: "PULSE",
    icon: "pulse",
    description: "Economic intelligence with macro indicators and sub-national risk scoring",
    status: "beta",
    features: [
      "Macro dashboard",
      "Sub-national proxies",
      "Investment risk scoring",
      "Energy sector intel",
      "Trade flow analysis",
    ],
  },
  {
    id: "foresight",
    name: "FORESIGHT",
    icon: "foresight",
    description: "Predictive analytics with Bayesian conflict escalation and scenario modeling",
    status: "beta",
    features: [
      "Conflict escalation models",
      "Election forecasting",
      "Displacement prediction",
      "Scenario modeling",
      "Climate-security correlation",
    ],
  },
  {
    id: "forge",
    name: "FORGE",
    icon: "forge",
    description: "Analyst workbench with collaborative authoring and structured analytic techniques",
    status: "beta",
    features: [
      "Collaborative docs",
      "SAT templates",
      "Evidence management",
      "Auto-report generation",
      "API integration",
    ],
  },
  {
    id: "sti",
    name: "STI",
    icon: "sti",
    description: "Sectarianism Tension Index — real-time ethno-sectarian dynamics across Arabs, Kurds, Turkmen, and minorities",
    status: "active",
    features: [
      "6-axis composite score",
      "Arab-Kurd-Turkmen tri-ethnic tracking",
      "15-min real-time updates",
      "Governorate + hotspot heatmap",
      "Ethno-religious minority coverage",
    ],
  },
];

// ── PULSE Data ──────────────────────────────────────────────────────
export const economicIndicators: EconomicIndicator[] = [
  { name: "Oil Production", value: "4.58M bbl/day", change: "+1.2%", trend: "up" },
  { name: "USD/IQD Rate", value: "1,310", change: "-0.3%", trend: "down" },
  { name: "CPI Inflation", value: "4.8%", change: "+0.2%", trend: "up" },
  { name: "GDP Growth (est.)", value: "3.1%", change: "+0.4%", trend: "up" },
  { name: "Fed. Budget Exec.", value: "62%", change: "+8%", trend: "up" },
  { name: "Unemployment", value: "16.2%", change: "-0.5%", trend: "down" },
];

export const energySectorData: EnergySectorData[] = [
  { metric: "Oil Production", value: "4.58M bbl/day", target: "OPEC: 4.431M", status: "Above Quota" },
  { metric: "Brent Crude", value: "$78.42", change: "+1.2%", status: "Ascending" },
  { metric: "KRI Exports", value: "Halted", detail: "Pipeline dispute", status: "Offline" },
  { metric: "Gas Flaring", value: "17.8 BCM/yr", detail: "↓ 3% YoY", status: "Improving" },
];

export const investmentRisks: InvestmentRisk[] = [
  { gov: "Erbil", risk: 35, grade: "B+", sector: "Real Estate, Oil" },
  { gov: "Basra", risk: 42, grade: "B", sector: "Energy, Port" },
  { gov: "Baghdad", risk: 58, grade: "C+", sector: "Banking, Telecom" },
  { gov: "Sulaymaniyah", risk: 38, grade: "B+", sector: "Tourism, Agri" },
  { gov: "Najaf", risk: 30, grade: "A-", sector: "Religious Tourism" },
  { gov: "Kirkuk", risk: 78, grade: "D-", sector: "Oil (Tri-Ethnic)" },
  { gov: "Tuz Khurmatu", risk: 74, grade: "D", sector: "Agri (Turkmen)" },
  { gov: "Tal Afar", risk: 66, grade: "C-", sector: "Trade (Turkmen)" },
  { gov: "Nineveh", risk: 65, grade: "C-", sector: "Reconstruction" },
];

export const tradeFlows: TradeFlow[] = [
  { country: "China", volume: "$12.8B", type: "Import", pct: 28 },
  { country: "India", volume: "$8.9B", type: "Export", pct: 22 },
  { country: "Turkey", volume: "$7.2B", type: "Import", pct: 16 },
  { country: "Iran", volume: "$5.8B", type: "Import", pct: 13 },
  { country: "S. Korea", volume: "$4.1B", type: "Export", pct: 10 },
];

// ── LENS Data ───────────────────────────────────────────────────────
export const platformStats: PlatformStat[] = [
  { platform: "Telegram", posts: "8,420", trend: "+24%", color: "#0088cc", icon: "📨" },
  { platform: "Facebook (Iraqi)", posts: "12,380", trend: "+8%", color: "#1877F2", icon: "📘" },
  { platform: "X / Twitter", posts: "5,910", trend: "-3%", color: "#1DA1F2", icon: "🐦" },
];

export const trendingNarratives: Narrative[] = [
  { narrative: "Budget allocation dispute escalation", volume: 2847, sentiment: -0.68, platforms: ["Telegram", "Facebook"], stiRelevant: true, disinfoRisk: "LOW" },
  { narrative: "Peshmerga-ISF Makhmur standoff (Arabic framing)", volume: 1923, sentiment: -0.82, platforms: ["X", "Telegram"], stiRelevant: true, disinfoRisk: "MEDIUM" },
  { narrative: "Counter-narrative: cross-sectarian electoral reform", volume: 987, sentiment: 0.45, platforms: ["Facebook", "X"], stiRelevant: true, disinfoRisk: "NONE" },
  { narrative: "IRGC anti-US messaging campaign (coordinated)", volume: 3210, sentiment: -0.91, platforms: ["Telegram"], stiRelevant: true, disinfoRisk: "HIGH" },
  { narrative: "Turkmen property seizures in Kirkuk (ITF documentation)", volume: 1456, sentiment: -0.87, platforms: ["Facebook", "Telegram"], stiRelevant: true, disinfoRisk: "LOW" },
  { narrative: "Southern marshland drought displacement coverage", volume: 642, sentiment: -0.55, platforms: ["Facebook", "YouTube"], stiRelevant: false, disinfoRisk: "NONE" },
];

export const coordinatedCampaigns: CoordinatedCampaign[] = [
  { name: "IRGC Anti-US Network", accounts: 847, origin: "Iran", confidence: 0.92 },
  { name: "Pro-Sadrist Retweet Ring", accounts: 234, origin: "Iraq", confidence: 0.78 },
  { name: "KDP Media Amplification", accounts: 156, origin: "Iraq (KRI)", confidence: 0.65 },
];

export const mediaCredibility: MediaCredibility[] = [
  { name: "Rudaw", score: 78, bias: "Pro-KDP" },
  { name: "Turkmeneli TV", score: 62, bias: "Pro-Turkmen/ITF" },
  { name: "Al Sumaria", score: 65, bias: "Independent/Shia" },
  { name: "Shafaq News", score: 72, bias: "Independent" },
  { name: "NRT", score: 70, bias: "Pro-PUK" },
  { name: "Al Jazeera Arabic", score: 68, bias: "Pan-Arab/Qatar" },
];

// ── MENA Regional Coverage ──────────────────────────────────────────
export const menaRegions = [
  {
    subRegion: "Levant",
    countries: ["Syria", "Lebanon", "Jordan", "Palestine"],
    threatLevel: "HIGH",
    keyIssues: ["Conflict", "Reconstruction", "Refugees", "HTS/SDF dynamics"],
  },
  {
    subRegion: "Gulf",
    countries: ["Saudi Arabia", "UAE", "Qatar", "Kuwait", "Bahrain", "Oman"],
    threatLevel: "ELEVATED",
    keyIssues: ["Energy transition", "Vision 2030", "Iran tensions", "Defense"],
  },
  {
    subRegion: "North Africa",
    countries: ["Egypt", "Libya", "Tunisia", "Algeria", "Morocco"],
    threatLevel: "ELEVATED",
    keyIssues: ["Governance", "Migration", "Sahel spillover", "Great power competition"],
  },
  {
    subRegion: "Yemen / Horn",
    countries: ["Yemen", "Djibouti", "Somalia", "Eritrea"],
    threatLevel: "CRITICAL",
    keyIssues: ["Houthis", "Red Sea", "Humanitarian crisis", "Gulf proxies"],
  },
  {
    subRegion: "Iran",
    countries: ["Islamic Republic of Iran"],
    threatLevel: "HIGH",
    keyIssues: ["Nuclear", "IRGC", "Sanctions", "Proxy networks"],
  },
  {
    subRegion: "Turkey",
    countries: ["Republic of Turkey"],
    threatLevel: "ELEVATED",
    keyIssues: ["Kurdish policy", "Syria operations", "NATO", "Economy"],
  },
];

// ── Foresight Data ──────────────────────────────────────────────────
export const conflictForecasts: ConflictForecast[] = [
  { id: "F-001", region: "Kirkuk", scenario: "Arab-Kurd-Turkmen Escalation", probability: 0.72, horizon: "7-day", drivers: ["PMF repositioning in Laylan", "KDP-Baghdad oil revenue dispute", "Turkmen ITC protest mobilization"], stiAxis: "Arab-Kurd-Turkmen", confidence: 0.84, trend: "rising", impact: "high" },
  { id: "F-002", region: "Diyala", scenario: "Sectarian Displacement Wave", probability: 0.58, horizon: "14-day", drivers: ["Sunni farmland seizures near Muqdadiyah", "Asa'ib Ahl al-Haq checkpoint expansion", "Water shortage displacement"], stiAxis: "Sunni-Shia", confidence: 0.76, trend: "stable", impact: "critical" },
  { id: "F-003", region: "Basra", scenario: "Intra-Shia Factional Clashes", probability: 0.45, horizon: "30-day", drivers: ["Port revenue redistribution dispute", "Sadrist vs Coordination Framework local elections", "Iranian consulate protest"], stiAxis: "Intra-Shia", confidence: 0.69, trend: "declining", impact: "medium" },
  { id: "F-004", region: "Sinjar", scenario: "Governance Vacuum Exploitation", probability: 0.63, horizon: "14-day", drivers: ["PKK/YBS withdrawal deadline", "Yazidi return frustration", "Turkiye cross-border operations"], stiAxis: "Ethno-Religious Minorities", confidence: 0.72, trend: "rising", impact: "high" },
  { id: "F-005", region: "Sulaymaniyah", scenario: "KDP-PUK Revenue Dispute Escalation", probability: 0.38, horizon: "30-day", drivers: ["Budget allocation deadlock", "Dual Peshmerga command friction", "Civil servant salary delays"], stiAxis: "KDP-PUK", confidence: 0.81, trend: "stable", impact: "medium" },
  { id: "F-006", region: "Nineveh Plains", scenario: "Minority Community Tension Spike", probability: 0.51, horizon: "7-day", drivers: ["Shabak militia vs Assyrian community land dispute", "Babylon Brigade expansion in Hamdaniya", "Christian emigration surge"], stiAxis: "Ethno-Religious Minorities", confidence: 0.67, trend: "rising", impact: "high" },
];

export const displacementPredictions: DisplacementPrediction[] = [
  { governorate: "Kirkuk", currentIDPs: 42800, predicted30d: 47200, predicted90d: 53100, risk: "high", driver: "Sectarian + Land" },
  { governorate: "Diyala", currentIDPs: 38500, predicted30d: 44100, predicted90d: 51800, risk: "critical", driver: "Armed Conflict" },
  { governorate: "Nineveh", currentIDPs: 156000, predicted30d: 149000, predicted90d: 139000, risk: "medium", driver: "Return Flow" },
  { governorate: "Anbar", currentIDPs: 67200, predicted30d: 64800, predicted90d: 61200, risk: "medium", driver: "Climate + Water" },
  { governorate: "Salah ad-Din", currentIDPs: 31400, predicted30d: 33100, predicted90d: 35800, risk: "high", driver: "Security + Drought" },
  { governorate: "Basra", currentIDPs: 12800, predicted30d: 15600, predicted90d: 21400, risk: "high", driver: "Climate Crisis" },
];

export const scenarioModels: ScenarioModel[] = [
  { id: "SCN-A", name: "Baseline — Status Quo", description: "Current trajectory continues. Gradual sectarian normalization, with periodic spikes around elections and budget cycles.", probability: 0.45, stiProjection: [65, 63, 61, 59, 62, 64, 60, 58, 56, 55, 57, 54], color: "#3A5A7C" },
  { id: "SCN-B", name: "Escalation — Regional Spillover", description: "Iran-US tensions escalate.", probability: 0.25, stiProjection: [65, 68, 72, 76, 78, 82, 85, 83, 80, 79, 81, 84], color: "#C13A1B" },
  { id: "SCN-C", name: "De-escalation — Grand Bargain", description: "Baghdad-Erbil budget agreement.", probability: 0.20, stiProjection: [65, 62, 58, 54, 50, 47, 44, 42, 40, 38, 36, 35], color: "#2D8B4E" },
  { id: "SCN-D", name: "Crisis — Climate Collapse", description: "Severe drought summer 2026.", probability: 0.10, stiProjection: [65, 67, 70, 74, 79, 85, 88, 91, 89, 86, 84, 82], color: "#D47B2A" },
];

// ── Forge Data ──────────────────────────────────────────────────────
export const reports: Report[] = [
  { id: "RPT-2026-0147", title: "Kirkuk Governorate — Sectarian Dynamics Assessment Q2 2026", classification: "CONFIDENTIAL", author: "Mohammed A. Mohammed", status: "draft", lastModified: "2026-04-10T18:30:00Z", template: "Intelligence Assessment", sections: 8, sources: 24, wordCount: 4280, stiRelevance: ["Arab-Kurd-Turkmen", "Ethno-Religious Minorities"], collaborators: ["Rasha K.", "Ahmed S."] },
  { id: "RPT-2026-0146", title: "PMF Force Disposition — Diyala Province Update", classification: "SECRET", author: "Ahmed S. Ibrahim", status: "review", lastModified: "2026-04-10T14:15:00Z", template: "Military Assessment", sections: 6, sources: 18, wordCount: 3150, stiRelevance: ["Sunni-Shia"], collaborators: ["Mohammed A."] },
  { id: "RPT-2026-0142", title: "Basra Water Crisis — Climate-Security Nexus Brief", classification: "RESTRICTED", author: "Sara M. Hassan", status: "published", lastModified: "2026-04-09T09:00:00Z", template: "Policy Brief", sections: 5, sources: 31, wordCount: 5620, stiRelevance: ["Intra-Shia", "Tribal"], collaborators: ["Mohammed A.", "Noor F."] },
  { id: "RPT-2026-0139", title: "KDP-PUK Relations — Post-Election Scenario Analysis", classification: "CONFIDENTIAL", author: "Mohammed A. Mohammed", status: "published", lastModified: "2026-04-08T16:45:00Z", template: "Scenario Brief", sections: 7, sources: 15, wordCount: 3880, stiRelevance: ["KDP-PUK"], collaborators: [] },
  { id: "RPT-2026-0135", title: "Sinjar Agreement — Implementation Failure Analysis", classification: "RESTRICTED", author: "Rasha K. Ahmed", status: "archived", lastModified: "2026-04-06T11:20:00Z", template: "ACH Workbook", sections: 4, sources: 22, wordCount: 6100, stiRelevance: ["Ethno-Religious Minorities"], collaborators: ["Mohammed A.", "Ahmed S."] },
];

export const satTemplates: SatTemplate[] = [
  { id: "ach", name: "Analysis of Competing Hypotheses", icon: "microscope", count: 12, description: "Evaluate evidence against multiple hypotheses" },
  { id: "ka", name: "Key Assumptions Check", icon: "target", count: 8, description: "Identify and challenge foundational assumptions" },
  { id: "rt", name: "Red Team Analysis", icon: "shield-alert", count: 5, description: "Adversarial perspective and devil's advocate" },
  { id: "what-if", name: "What-If / Scenario", icon: "git-branch", count: 15, description: "Explore alternative futures and contingencies" },
  { id: "indicators", name: "Indicators & Warnings", icon: "alert-triangle", count: 9, description: "Define signposts for escalation/de-escalation" },
  { id: "timeline", name: "Chronological Reconstruction", icon: "clock", count: 7, description: "Sequence events to identify patterns" },
];

export const evidenceItems: EvidenceItem[] = [
  { id: "EV-847", type: "SIGINT", grade: "B2", source: "Al Sumaria TV", date: "2026-04-10", relevance: "Kirkuk PMF", reliability: "Usually reliable" },
  { id: "EV-846", type: "OSINT", grade: "A1", source: "ACLED Database", date: "2026-04-10", relevance: "Diyala conflict", reliability: "Completely reliable" },
  { id: "EV-845", type: "HUMINT", grade: "C3", source: "Field Contact #12", date: "2026-04-09", relevance: "Basra unrest", reliability: "Fairly reliable" },
  { id: "EV-844", type: "OSINT", grade: "B1", source: "Rudaw News", date: "2026-04-09", relevance: "KDP-PUK talks", reliability: "Usually reliable" },
  { id: "EV-843", "type": "GEOINT", grade: "A2", source: "Sentinel-2", date: "2026-04-09", relevance: "Sinjar movements", reliability: "Completely reliable" },
  { id: "EV-842", "type": "SOCMINT", grade: "D4", source: "Telegram Channel", date: "2026-04-08", relevance: "Sadrist rhetoric", reliability: "Not usually reliable" },
  { id: "EV-841", type: "OSINT", grade: "B2", source: "NRT Arabic", date: "2026-04-08", relevance: "Turkmen ITC protest", reliability: "Usually reliable" },
];
