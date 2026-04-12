// ═══════════════════════════════════════════════════════════════════
// MERIDIAN — Iraqi Armed Groups Network Dataset
// Node-edge data for NexusView graph and NEXUS actor profiles
// Covers: militias, political parties, tribal federations,
//         Kurdish factions, minority armed groups, external patrons
// ═══════════════════════════════════════════════════════════════════

export interface NetworkNode {
  id: string;
  name: string;
  nameAr?: string;
  nameKu?: string;
  type: "militia" | "party" | "government" | "tribe" | "foreign" | "security" | "clerical";
  category: "pmf" | "sunni" | "kurdish" | "government" | "external" | "minority" | "tribal";
  founded?: number;
  leader?: string;
  strength?: string;        // e.g. "8,000–12,000" fighters
  funding?: string;
  ideology?: string;
  location?: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  description: string;
  connections: number;      // approximate active connections
  lastActive?: string;
  tags: string[];
}

export interface NetworkEdge {
  source: string;           // node id
  target: string;           // node id
  relationship: "command" | "alliance" | "rivalry" | "patron" | "rivalry-armed" | "coordinates" | "affiliated" | "opposition" | "merge";
  strength: "weak" | "moderate" | "strong";
  description?: string;
  active: boolean;
}

// ── NODES ──────────────────────────────────────────────────────────

export const networkNodes: NetworkNode[] = [

  // ── External Patrons ──────────────────────────────────────────
  {
    id: "iran-irgc", name: "Iran / IRGC-QF", nameAr: "إيران / فيلق القدس",
    type: "foreign", category: "external", founded: 1979,
    leader: "Esmail Qaani (QF commander post-Soleimani)",
    riskLevel: "critical",
    description: "Iran's Islamic Revolutionary Guard Corps - Quds Force. Primary patron, trainer, and financier of the largest PMF factions. Provides missiles, drones, intelligence, and strategic direction. Represents the most significant external influence on Iraq's armed landscape.",
    connections: 18, lastActive: "2026-04",
    tags: ["iran", "irgc", "quds", "patron", "shiite"],
    ideology: "Wilayat al-Faqih — Khomeinist",
    funding: "State budget + IRGC commercial enterprises",
  },
  {
    id: "usa-centcom", name: "United States / CENTCOM", type: "foreign", category: "external",
    riskLevel: "medium",
    description: "US military presence via CENTCOM. ~2,500 troops remaining under bilateral security agreement. Advises Iraqi Army and SDF. Primary rival to Iranian influence in Iraq. Conducts strikes on Iran-aligned militias.",
    connections: 8, lastActive: "2026-04",
    tags: ["usa", "centcom", "coalition", "military"],
  },
  {
    id: "turkey", name: "Turkey / MIT", type: "foreign", category: "external",
    riskLevel: "high",
    description: "Turkish military operates checkpoints in northern Kurdistan. Strikes PKK/YPG positions. Backs Sunni Turkmen factions. Key player in KRG oil revenue via Ceyhan pipeline.",
    connections: 6, lastActive: "2026-04",
    tags: ["turkey", "mit", "turkmen", "pkk", "pipeline"],
  },

  // ── Government / State ────────────────────────────────────────
  {
    id: "iraqi-army", name: "Iraqi Army (ISF)", nameAr: "الجيش العراقي",
    type: "security", category: "government", founded: 2003,
    strength: "196,000 active",
    riskLevel: "medium",
    description: "Post-2003 Iraqi Security Forces. Rebuilt after 2014 collapse. Mixed competency. Subject to parallel PMF command structures in many operations. Divided loyalties at unit level.",
    connections: 12, lastActive: "2026-04",
    tags: ["army", "isf", "state", "security"],
  },
  {
    id: "sudani-govt", name: "Sudani Government", nameAr: "حكومة السوداني",
    type: "government", category: "government", founded: 2022,
    leader: "Mohammed Shia' al-Sudani",
    riskLevel: "medium",
    description: "Current Iraqi government (since Oct 2022). Backed by Iran-aligned Coordination Framework while maintaining US security agreement. Navigating structural PMF-state integration.",
    connections: 14, lastActive: "2026-04",
    tags: ["government", "sudani", "pm", "2022"],
  },
  {
    id: "sistani", name: "Grand Ayatollah Ali al-Sistani", nameAr: "المرجعية العليا",
    type: "clerical", category: "government", location: "Najaf",
    riskLevel: "low",
    description: "Iraq's senior Shia religious authority (Marja'iyya). Major influence on Iraqi politics through religious rulings. Issued 2014 fatwa creating PMF. Critical check on Iranian-style theocracy.",
    connections: 10, lastActive: "2026-04",
    tags: ["sistani", "marjaiya", "najaf", "shia", "fatwa"],
  },

  // ── Iran-aligned PMF Factions ─────────────────────────────────
  {
    id: "kataib-hezbollah", name: "Kataib Hezbollah", nameAr: "كتائب حزب الله",
    type: "militia", category: "pmf", founded: 2006,
    leader: "Abu Hussein al-Hamidawi (post-Muhandis)",
    strength: "10,000–15,000",
    riskLevel: "critical",
    description: "Most operationally capable Iran-aligned PMF faction. Designated FTO by US. Conducts rocket and drone strikes on US forces. IRGC-trained. Abu Mahdi al-Muhandis co-founded; killed with Soleimani Jan 2020.",
    connections: 9, lastActive: "2026-04",
    tags: ["kataib", "hezbollah", "pmf", "iran", "fto", "rockets"],
    ideology: "Khomeinist",
    funding: "IRGC / PMF state salary",
  },
  {
    id: "badr-org", name: "Badr Organization", nameAr: "منظمة بدر",
    type: "militia", category: "pmf", founded: 1982,
    leader: "Hadi al-Amiri",
    strength: "20,000–30,000",
    riskLevel: "high",
    description: "Largest and oldest Iran-linked PMF faction. Founded in Iran during Iran-Iraq war. Amiri controls Interior Ministry portfolios. More politically integrated than purely military factions.",
    connections: 14, lastActive: "2026-04",
    tags: ["badr", "amiri", "pmf", "iran", "interior-ministry"],
    ideology: "Islamic — IRGC-trained",
    funding: "PMF state salary + Iran",
  },
  {
    id: "asa-ib", name: "Asa'ib Ahl al-Haq", nameAr: "عصائب أهل الحق",
    type: "militia", category: "pmf", founded: 2006,
    leader: "Qais al-Khazali",
    strength: "10,000–13,000",
    riskLevel: "critical",
    description: "League of the Righteous. Splinter from Mahdi Army. Designated FTO. Conducts IED/EFP attacks on US forces. Politically active as Sadiqun bloc in parliament.",
    connections: 8, lastActive: "2026-04",
    tags: ["asa-ib", "khazali", "pmf", "ied", "fto"],
    ideology: "Khomeinist",
    funding: "IRGC / PMF state salary",
  },
  {
    id: "nujaba", name: "Harakat Hezbollah al-Nujaba", nameAr: "حركة حزب الله النجباء",
    type: "militia", category: "pmf", founded: 2013,
    leader: "Akram Abbas al-Kabi",
    strength: "5,000+",
    riskLevel: "critical",
    description: "Highly ideologically aligned with IRGC Khomeinist doctrine. Deploys fighters to Syria for Assad. Designated FTO. Known for hardline anti-US and anti-normalization positions.",
    connections: 6, lastActive: "2026-04",
    tags: ["nujaba", "hezbollah", "pmf", "syria", "fto"],
    ideology: "Khomeinist",
    funding: "IRGC",
  },
  {
    id: "imam-ali-brigades", name: "Imam Ali Brigades", nameAr: "كتائب الإمام علي",
    type: "militia", category: "pmf", founded: 2014,
    leader: "Shibl al-Zaydi",
    strength: "5,000–7,000",
    riskLevel: "high",
    description: "PMF faction that fought ISIS. Iran-aligned. Deployed to Syria. Accused of atrocities in liberated Sunni areas. Politically backed by Fatah Alliance.",
    connections: 5, lastActive: "2026-04",
    tags: ["imam-ali", "pmf", "iran", "fatah"],
    ideology: "Shiite militia",
    funding: "PMF state salary + Iran",
  },
  {
    id: "pmf-general", name: "PMF / Hashed al-Sha'bi", nameAr: "الحشد الشعبي",
    type: "militia", category: "pmf", founded: 2014,
    strength: "130,000–160,000 total",
    riskLevel: "high",
    description: "Umbrella body of 67 factions. Formally state institution since 2016. Largest paramilitary force in Iraq. Dominated by Iran-aligned factions, but includes nationalist and Sunni/Christian units.",
    connections: 20, lastActive: "2026-04",
    tags: ["pmf", "hashed", "umbrella", "2014"],
  },

  // ── Sadrist / Nationalist Shia ────────────────────────────────
  {
    id: "sadr", name: "Muqtada al-Sadr / Sadrists", nameAr: "التيار الصدري",
    type: "party", category: "pmf", founded: 2003,
    leader: "Muqtada al-Sadr",
    riskLevel: "high",
    description: "Powerful Iraqi nationalist Shia movement. 73 seats in 2021 elections (largest bloc). Claims independence from Iran. Commands Saraya al-Salam militia. Boycotted parliament after June 2022 impasse.",
    connections: 12, lastActive: "2026-04",
    tags: ["sadr", "sadrists", "nationalist", "parliament", "saraya-al-salam"],
    ideology: "Iraqi nationalist Shiism",
  },
  {
    id: "saraya-al-salam", name: "Saraya al-Salam", nameAr: "سرايا السلام",
    type: "militia", category: "pmf",
    leader: "Commands loyal to Sadr",
    strength: "50,000+",
    riskLevel: "high",
    description: "Sadrist paramilitary — reformed Mahdi Army. Fought ISIS alongside PMF. Clashed with Iran-aligned factions at Najaf shrine and Green Zone (2022). Sadr uses as political leverage.",
    connections: 5, lastActive: "2026-04",
    tags: ["saraya-al-salam", "sadr", "mahdi-army", "nationalist"],
    ideology: "Iraqi nationalist Shiism",
  },

  // ── Sunni Factions ────────────────────────────────────────────
  {
    id: "sunni-tribal", name: "Sunni Tribal Confederations", nameAr: "العشائر السنية",
    type: "tribe", category: "sunni",
    location: "Anbar, Nineveh, Diyala, Salahaddin",
    riskLevel: "medium",
    description: "Major Sunni tribal confederations: Dulaym (largest), Jabbour, Hadidi, Ubayd. Played decisive Sahwa role 2006-2008. Now splintered. Some cooperate with PMF, others resist.",
    connections: 8, lastActive: "2026-04",
    tags: ["sunni", "tribal", "sahwa", "dulaym", "anbar"],
  },
  {
    id: "sunni-parliament", name: "Sunni Parliamentary Blocs", nameAr: "التكتلات البرلمانية السنية",
    type: "party", category: "sunni",
    leader: "Mohammed al-Halbousi (Speaker), Khamis al-Khanjar",
    riskLevel: "low",
    description: "Taqaddum party (Halbousi) and Azm Alliance (Khanjar). Internal rivalries limit Sunni political cohesion. Halbousi removed as Speaker by Federal Court Dec 2023.",
    connections: 6, lastActive: "2026-04",
    tags: ["sunni", "parliament", "halbousi", "khanjar", "taqaddum"],
  },
  {
    id: "isis-remnants", name: "ISIS Underground / Wilayat Iraq", nameAr: "تنظيم داعش",
    type: "militia", category: "sunni", founded: 2006,
    strength: "3,000–5,000 active",
    riskLevel: "critical",
    description: "ISIS Wilayat Iraq continues as underground insurgency in Anbar, Nineveh, Diyala, and Kirkuk rural areas. Conducts IEDs, assassinations, checkpoint ambushes. No longer controls territory but maintains sleeper networks.",
    connections: 4, lastActive: "2026-04",
    tags: ["isis", "daesh", "insurgency", "underground", "anbar"],
    ideology: "Salafi-jihadi",
  },
  {
    id: "hamas-iraq", name: "Hamas Iraq / Hamas al-Iraq", nameAr: "حماس العراق",
    type: "militia", category: "sunni",
    riskLevel: "medium",
    description: "Sunni armed group active in Diyala. Unrelated to Palestinian Hamas. Conducts sectarian attacks. Some overlap with ISIS predecessor networks.",
    connections: 3, lastActive: "2025-12",
    tags: ["hamas-iraq", "sunni", "diyala", "militia"],
  },

  // ── Kurdish Factions ──────────────────────────────────────────
  {
    id: "kdp", name: "Kurdistan Democratic Party (KDP)", nameAr: "الحزب الديمقراطي الكردستاني", nameKu: "Partiya Demokrata Kurdistanê",
    type: "party", category: "kurdish", founded: 1946,
    leader: "Masrour Barzani (PM), Nechirvan Barzani (President)",
    riskLevel: "medium",
    description: "Dominant party in Erbil and Dohuk. Controls ~65,000 peshmerga. More Turkey-aligned than PUK. Barzani family controls state functions. Ongoing revenue dispute with Baghdad.",
    connections: 12, lastActive: "2026-04",
    tags: ["kdp", "barzani", "erbil", "peshmerga", "kurdish"],
    ideology: "Kurdish nationalism",
  },
  {
    id: "puk", name: "Patriotic Union of Kurdistan (PUK)", nameAr: "الاتحاد الوطني الكردستاني", nameKu: "Yekîtiya Nîştimaniya Kurdistanê",
    type: "party", category: "kurdish", founded: 1975,
    leader: "Bafel Talabani",
    riskLevel: "medium",
    description: "Controls Sulaymaniyah and Halabja. More Iran-aligned than KDP. ~40,000 peshmerga. Stood down at Kirkuk in 2017, allowing Iraqi Army entry. Internal clan tensions post-Jalal Talabani death.",
    connections: 10, lastActive: "2026-04",
    tags: ["puk", "talabani", "sulaymaniyah", "peshmerga", "kurdish"],
    ideology: "Kurdish nationalism (left-leaning)",
  },
  {
    id: "peshmerga", name: "Kurdish Peshmerga", nameKu: "Pêşmerge",
    type: "security", category: "kurdish",
    strength: "160,000–200,000 (combined KDP+PUK)",
    riskLevel: "low",
    description: "Kurdish regional armed forces. Played key role fighting ISIS (2014-2017). Still frozen on disputed territory lines with ISF/PMF. Pay reform a major ongoing grievance.",
    connections: 8, lastActive: "2026-04",
    tags: ["peshmerga", "kdp", "puk", "kurdish", "fighters"],
  },
  {
    id: "pkk", name: "PKK / PJAK", nameKu: "Partiya Karkerên Kurdistanê",
    type: "militia", category: "kurdish", founded: 1978,
    leader: "Abdullah Öcalan (imprisoned)", location: "Qandil Mountains",
    riskLevel: "high",
    description: "Turkish-designated terrorist organization. Maintains bases in Qandil Mountains (KRI/Iran border). PJAK is Iranian-Kurdish wing. Turkey conducts regular airstrikes. Controls Sinjar (NPÊ forces). Center of Baghdad-KRG-Turkey disputes.",
    connections: 7, lastActive: "2026-04",
    tags: ["pkk", "pjak", "qandil", "turkey", "sinjar", "ocalan"],
    ideology: "Marxist-Kurdish nationalism",
  },
  {
    id: "goran", name: "Goran Movement (Change)", nameAr: "حركة التغيير",
    type: "party", category: "kurdish", founded: 2009,
    leader: "Omar Said Ali",
    riskLevel: "low",
    description: "Third party opposing KDP-PUK duopoly. Anti-corruption, reform-focused. Declined after 2018. Merger talks with other opposition forces ongoing.",
    connections: 4, lastActive: "2026-04",
    tags: ["goran", "change", "kurdish", "opposition", "reform"],
  },

  // ── Minority Armed Groups ─────────────────────────────────────
  {
    id: "yazidi-forces", name: "Yazidi Armed Groups", nameAr: "قوات إيزيدية",
    type: "militia", category: "minority",
    location: "Sinjar",
    riskLevel: "medium",
    description: "Multiple armed groups: YBS (PKK-linked NPÊ, 2,000–3,000), Ezidkhan fighters, HDK. Competing for Sinjar control. Baghdad and KRG both claim jurisdiction. Block Yazidi civilian return.",
    connections: 5, lastActive: "2026-04",
    tags: ["yazidi", "ybs", "sinjar", "pkk", "minority"],
  },
  {
    id: "assyrian-ktv", name: "Assyrian/Christian Militia forces", nameAr: "قوات سهل نينوى",
    type: "militia", category: "minority",
    location: "Nineveh Plains",
    riskLevel: "low",
    description: "Nineveh Plains Protection Units (NPU) and Babylon Brigades (PMF-controlled, Shabak). Multiple factions compete for Nineveh Plains. NPU aligned with KDP; Babylon Brigades with Badr.",
    connections: 4, lastActive: "2026-04",
    tags: ["assyrian", "christian", "npu", "babylon-brigades", "nineveh-plains"],
  },
  {
    id: "shabak", name: "Shabak Militias", nameAr: "قوات الشبك",
    type: "militia", category: "minority", location: "Nineveh Plains",
    riskLevel: "medium",
    description: "Shabak (heterodox Shia minority) armed units. Integrated into PMF as Babylon Brigades under Badr leadership. Contested Shabak identity (Shia vs Sunni) fuels local friction with Sunni Arabs and Assyrians.",
    connections: 4, lastActive: "2026-04",
    tags: ["shabak", "pmf", "nineveh-plains", "babylon-brigades", "minority"],
  },
  {
    id: "turkmen-front", name: "Iraqi Turkmen Front", nameAr: "الجبهة التركمانية العراقية",
    type: "party", category: "minority", location: "Kirkuk, Tal Afar",
    riskLevel: "medium",
    description: "Main political umbrella for Turkmens. Turkey-backed. Contests Kirkuk's Arab-Kurd-Turkmen status. Turkmen militias fought ISIS in Tal Afar. Seeks autonomous Turkmen region.",
    connections: 5, lastActive: "2026-04",
    tags: ["turkmen", "kirkuk", "tal-afar", "turkey", "minority"],
  },
];

// ── EDGES ──────────────────────────────────────────────────────────

export const networkEdges: NetworkEdge[] = [
  // Iran → PMF factions
  { source: "iran-irgc", target: "kataib-hezbollah", relationship: "patron", strength: "strong", description: "Direct IRGC command and finance", active: true },
  { source: "iran-irgc", target: "badr-org", relationship: "patron", strength: "strong", description: "Founded by IRGC in exile (1982)", active: true },
  { source: "iran-irgc", target: "asa-ib", relationship: "patron", strength: "strong", description: "IRGC trains and finances", active: true },
  { source: "iran-irgc", target: "nujaba", relationship: "patron", strength: "strong", description: "Ideologically closest to IRGC doctrine", active: true },
  { source: "iran-irgc", target: "imam-ali-brigades", relationship: "patron", strength: "moderate", description: "Financial and material support", active: true },
  { source: "iran-irgc", target: "puk", relationship: "patron", strength: "moderate", description: "Iran-PUK tacit alignment; stood down at Kirkuk", active: true },
  { source: "iran-irgc", target: "pmf-general", relationship: "command", strength: "strong", description: "Effective operational command over Iran-aligned majority", active: true },

  // PMF umbrella
  { source: "pmf-general", target: "kataib-hezbollah", relationship: "affiliated", strength: "strong", active: true },
  { source: "pmf-general", target: "badr-org", relationship: "affiliated", strength: "strong", active: true },
  { source: "pmf-general", target: "asa-ib", relationship: "affiliated", strength: "strong", active: true },
  { source: "pmf-general", target: "saraya-al-salam", relationship: "affiliated", strength: "moderate", description: "Sadrists participate but maintain independence", active: true },
  { source: "pmf-general", target: "babel-brigades", relationship: "affiliated", strength: "moderate", active: false }, // removed from public dataset

  // Government relationships
  { source: "sudani-govt", target: "pmf-general", relationship: "coordinates", strength: "strong", description: "PMF formally integrated into state budget", active: true },
  { source: "sudani-govt", target: "iraqi-army", relationship: "command", strength: "moderate", description: "Formal command; practical tension with PMF parallel structures", active: true },
  { source: "sistani", target: "pmf-general", relationship: "affiliated", strength: "strong", description: "2014 fatwa created PMF; Sistani distances himself from Iran-aligned factions", active: true },

  // Sadr
  { source: "sadr", target: "saraya-al-salam", relationship: "command", strength: "strong", active: true },
  { source: "sadr", target: "pmf-general", relationship: "rivalry", strength: "moderate", description: "Sadrists resist full PMF integration under Iran influence", active: true },
  { source: "sadr", target: "asa-ib", relationship: "rivalry-armed", strength: "strong", description: "Armed clashes at Najaf shrine (2022)", active: true },
  { source: "sadr", target: "kataib-hezbollah", relationship: "rivalry-armed", strength: "strong", active: true },
  { source: "sadr", target: "sudani-govt", relationship: "opposition", strength: "moderate", description: "Sadr boycotts parliament, applies external pressure", active: true },

  // Sunni relationships
  { source: "sunni-tribal", target: "iraqi-army", relationship: "coordinates", strength: "weak", description: "Sahwa coordination largely dismantled", active: true },
  { source: "sunni-tribal", target: "isis-remnants", relationship: "rivalry-armed", strength: "moderate", description: "Some tribal elements resist ISIS, others co-opted", active: true },
  { source: "sunni-parliament", target: "iraqi-army", relationship: "coordinates", strength: "weak", active: true },
  { source: "isis-remnants", target: "sunni-parliament", relationship: "rivalry", strength: "moderate", description: "ISIS seeks to delegitimize Sunni political engagement", active: true },

  // Kurdish relationships
  { source: "kdp", target: "peshmerga", relationship: "command", strength: "strong", active: true },
  { source: "puk", target: "peshmerga", relationship: "command", strength: "strong", active: true },
  { source: "kdp", target: "puk", relationship: "rivalry", strength: "moderate", description: "Revenue sharing disputes; unified front against Baghdad", active: true },
  { source: "pkk", target: "kdp", relationship: "rivalry-armed", strength: "strong", description: "Turkey pressures KDP to evict PKK from KRI territory", active: true },
  { source: "pkk", target: "yazidi-forces", relationship: "command", strength: "strong", description: "YBS/NPÊ forces in Sinjar are PKK-linked", active: true },
  { source: "kdp", target: "yazidi-forces", relationship: "rivalry", strength: "moderate", description: "KDP claims Sinjar jurisdiction; PKK-linked YBS resists", active: true },
  { source: "turkey", target: "kdp", relationship: "patron", strength: "moderate", description: "Turkey finances KRG via oil pipeline; pressures KDP on PKK", active: true },
  { source: "turkey", target: "pkk", relationship: "rivalry-armed", strength: "strong", description: "Turkey conducts continuous airstrikes on Qandil", active: true },
  { source: "turkey", target: "turkmen-front", relationship: "patron", strength: "strong", active: true },

  // US relationships
  { source: "usa-centcom", target: "iraqi-army", relationship: "patron", strength: "moderate", description: "Training, advising, equipping ISF", active: true },
  { source: "usa-centcom", target: "kataib-hezbollah", relationship: "rivalry-armed", strength: "strong", description: "US designated FTO; conducts strikes after rocket attacks", active: true },
  { source: "usa-centcom", target: "asa-ib", relationship: "rivalry-armed", strength: "strong", description: "Designated FTO; conflict over US presence", active: true },
  { source: "usa-centcom", target: "nujaba", relationship: "rivalry-armed", strength: "strong", active: true },

  // Minority relationships
  { source: "shabak", target: "badr-org", relationship: "affiliated", strength: "strong", description: "Babylon Brigades under Badr organizational umbrella", active: true },
  { source: "shabak", target: "assyrian-ktv", relationship: "rivalry", strength: "moderate", description: "Competing for Nineveh Plains governance", active: true },
  { source: "assyrian-ktv", target: "kdp", relationship: "affiliated", strength: "moderate", description: "NPU maintains working relationship with KDP", active: true },

  // Badr → Interior Ministry
  { source: "badr-org", target: "sudani-govt", relationship: "affiliated", strength: "strong", description: "Amiri faction controls Interior Ministry portfolios", active: true },
];

// ── Helper functions ──────────────────────────────────────────────

export function getNodesByCategory(cat: NetworkNode["category"]): NetworkNode[] {
  return networkNodes.filter(n => n.category === cat);
}

export function getEdgesForNode(nodeId: string): NetworkEdge[] {
  return networkEdges.filter(e => e.source === nodeId || e.target === nodeId);
}

export function getNodeConnections(nodeId: string): { node: NetworkNode; edge: NetworkEdge }[] {
  return networkEdges
    .filter(e => e.active && (e.source === nodeId || e.target === nodeId))
    .map(edge => {
      const connectedId = edge.source === nodeId ? edge.target : edge.source;
      const node = networkNodes.find(n => n.id === connectedId);
      return node ? { node, edge } : null;
    })
    .filter(Boolean) as { node: NetworkNode; edge: NetworkEdge }[];
}

export const networkStats = {
  totalNodes: networkNodes.length,
  totalEdges: networkEdges.filter(e => e.active).length,
  criticalActors: networkNodes.filter(n => n.riskLevel === "critical").length,
  iranLinkedFactions: networkNodes.filter(n => n.tags.includes("iran") || n.category === "pmf").length,
  categories: {
    pmf: networkNodes.filter(n => n.category === "pmf").length,
    sunni: networkNodes.filter(n => n.category === "sunni").length,
    kurdish: networkNodes.filter(n => n.category === "kurdish").length,
    external: networkNodes.filter(n => n.category === "external").length,
    minority: networkNodes.filter(n => n.category === "minority").length,
    government: networkNodes.filter(n => n.category === "government").length,
  },
};
