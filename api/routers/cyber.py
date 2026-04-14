# ═══════════════════════════════════════════════════════════════════
# MERIDIAN — APT (Cyber Threat) Groups Router
# Sourced from G-APT-Monitor research database (57 groups)
# ═══════════════════════════════════════════════════════════════════

from fastapi import APIRouter

router = APIRouter()

# Complete APT database with geo-coordinates for map plotting
APT_GROUPS = [
    {"id": 1, "name": "APT28 (Fancy Bear)", "origin": "Russia", "targets": "Gov, Military, NATO", "description": "GRU-linked group known for DNC hack and attacks on elections.", "lat": 55.75, "lng": 37.61, "color": "#EF4444"},
    {"id": 2, "name": "APT29 (Cozy Bear)", "origin": "Russia", "targets": "Gov, Think Tanks, Tech", "description": "SVR-linked, stealthy, behind SolarWinds compromise.", "lat": 56.32, "lng": 38.13, "color": "#EF4444"},
    {"id": 3, "name": "Turla (Venomous Bear)", "origin": "Russia", "targets": "Gov, Military, Diplo", "description": "Advanced group using satellite exfiltration techniques.", "lat": 55.18, "lng": 36.89, "color": "#EF4444"},
    {"id": 4, "name": "Sandworm (Voodoo Bear)", "origin": "Russia", "targets": "Energy, Ukraine", "description": "Destructive attacks like BlackEnergy and NotPetya.", "lat": 56.85, "lng": 37.21, "color": "#EF4444"},
    {"id": 5, "name": "Gamaredon", "origin": "Russia", "targets": "Ukraine Gov/Military", "description": "FSB-linked, high volume operations against Ukraine.", "lat": 54.71, "lng": 38.50, "color": "#EF4444"},
    {"id": 6, "name": "Dragonfly (Energetic Bear)", "origin": "Russia", "targets": "Energy, Critical Infra", "description": "Focuses on sabotage and espionage in energy sector.", "lat": 57.62, "lng": 39.87, "color": "#EF4444"},
    {"id": 7, "name": "Silence", "origin": "Russia", "targets": "Financial, Banks", "description": "Cybercriminal group targeting financial institutions.", "lat": 56.95, "lng": 36.05, "color": "#EF4444"},
    {"id": 8, "name": "Wizard Spider", "origin": "Russia", "targets": "Financial, Big Game", "description": "TrickBot and Conti ransomware operators.", "lat": 54.19, "lng": 37.62, "color": "#EF4444"},
    {"id": 9, "name": "APT41 (Double Dragon)", "origin": "China", "targets": "Gaming, Tech, Health", "description": "Dual espionage and cybercrime operations.", "lat": 39.90, "lng": 116.40, "color": "#F59E0B"},
    {"id": 10, "name": "APT27 (Emissary Panda)", "origin": "China", "targets": "Aerospace, Gov", "description": "Uses custom malware like HiRAT against defense bases.", "lat": 31.23, "lng": 121.47, "color": "#F59E0B"},
    {"id": 11, "name": "APT40 (Krypton Panda)", "origin": "China", "targets": "Maritime, Engineering", "description": "Naval espionage supporting Belt and Road Initiative.", "lat": 18.25, "lng": 109.50, "color": "#F59E0B"},
    {"id": 12, "name": "APT10 (Stone Panda)", "origin": "China", "targets": "MSP, Tech, Japan", "description": "Cloud Hopper campaign targeting service providers.", "lat": 30.27, "lng": 120.15, "color": "#F59E0B"},
    {"id": 13, "name": "APT31 (Zirconium)", "origin": "China", "targets": "Gov, Political", "description": "Focus on intellectual property and political intel.", "lat": 22.54, "lng": 114.06, "color": "#F59E0B"},
    {"id": 14, "name": "Mustang Panda", "origin": "China", "targets": "NGOs, SE Asia", "description": "Targets NGOs and religious groups using USB worms.", "lat": 25.04, "lng": 102.68, "color": "#F59E0B"},
    {"id": 15, "name": "Hafnium", "origin": "China", "targets": "Exchange Servers, US", "description": "Exploited zero-days in MS Exchange servers.", "lat": 34.26, "lng": 108.94, "color": "#F59E0B"},
    {"id": 16, "name": "Deep Panda", "origin": "China", "targets": "US Gov, Defense", "description": "Focused on U.S. government personnel records.", "lat": 36.07, "lng": 120.38, "color": "#F59E0B"},
    {"id": 17, "name": "Wicked Panda", "origin": "China", "targets": "Pharma, Tech", "description": "Steals pharmaceutical and technology IP.", "lat": 23.13, "lng": 113.26, "color": "#F59E0B"},
    {"id": 18, "name": "Gothic Panda", "origin": "China", "targets": "Defense, Aero", "description": "Espionage targeting aerospace and defense contractors.", "lat": 28.23, "lng": 112.94, "color": "#F59E0B"},
    {"id": 19, "name": "Lazarus Group", "origin": "North Korea", "targets": "Banks, Crypto, Sony", "description": "State-sponsored, behind WannaCry and Sony hack.", "lat": 39.02, "lng": 125.75, "color": "#A855F7"},
    {"id": 20, "name": "APT37 (Reaper)", "origin": "North Korea", "targets": "South Korea, Japan", "description": "Targets South Korean government and media.", "lat": 39.10, "lng": 125.68, "color": "#A855F7"},
    {"id": 21, "name": "Kimsuky", "origin": "North Korea", "targets": "Nuclear, Diplomacy", "description": "Focuses on nuclear policy and diplomatic intelligence.", "lat": 38.95, "lng": 125.80, "color": "#A855F7"},
    {"id": 22, "name": "Andariel", "origin": "North Korea", "targets": "Defense, ATM", "description": "Sub-group of Lazarus targeting defense and finance.", "lat": 39.08, "lng": 125.72, "color": "#A855F7"},
    {"id": 23, "name": "BlueNoroff", "origin": "North Korea", "targets": "SWIFT, Banks", "description": "Financial theft via SWIFT and cryptocurrency.", "lat": 39.05, "lng": 125.78, "color": "#A855F7"},
    {"id": 24, "name": "APT33 (Elfin)", "origin": "Iran", "targets": "Aero, Energy", "description": "Iranian group targeting aviation and petrochemical.", "lat": 35.69, "lng": 51.39, "color": "#10B981"},
    {"id": 25, "name": "APT34 (OilRig)", "origin": "Iran", "targets": "Middle East Gov", "description": "Targets regional governments with custom tools.", "lat": 35.72, "lng": 51.42, "color": "#10B981"},
    {"id": 26, "name": "MuddyWater", "origin": "Iran", "targets": "Telco, Gov", "description": "MOIS-linked group targeting telecom and government.", "lat": 32.65, "lng": 51.68, "color": "#10B981"},
    {"id": 27, "name": "Charming Kitten", "origin": "Iran", "targets": "Journalists, Rights", "description": "Targets journalists, activists, and academics.", "lat": 35.65, "lng": 51.35, "color": "#10B981"},
    {"id": 28, "name": "Fox Kitten", "origin": "Iran", "targets": "VPN, Enterprise", "description": "Exploits VPN vulnerabilities for initial access.", "lat": 34.64, "lng": 50.88, "color": "#10B981"},
    {"id": 29, "name": "Lyceum", "origin": "Iran", "targets": "Energy, Telecom", "description": "Cyber espionage targeting energy and telecom in ME.", "lat": 36.30, "lng": 59.60, "color": "#10B981"},
    {"id": 30, "name": "APT32 (OceanLotus)", "origin": "Vietnam", "targets": "Auto, Manufacturing", "description": "Vietnamese state-sponsored cyber espionage.", "lat": 21.03, "lng": 105.85, "color": "#3B82F6"},
    {"id": 31, "name": "APT-C-35 (Patchwork)", "origin": "India", "targets": "Pakistan, China", "description": "Indian group using copied malware from other APTs.", "lat": 28.61, "lng": 77.21, "color": "#F97316"},
    {"id": 32, "name": "SideWinder", "origin": "India", "targets": "Pakistan Military", "description": "Targets Pakistani military and government.", "lat": 28.64, "lng": 77.18, "color": "#F97316"},
    {"id": 33, "name": "Bitter", "origin": "India", "targets": "China, Pakistan", "description": "Espionage targeting China and Pakistan defense.", "lat": 28.58, "lng": 77.24, "color": "#F97316"},
    {"id": 34, "name": "APT36 (Transparent Tribe)", "origin": "Pakistan", "targets": "Indian Army", "description": "Pakistani military intelligence cyber unit.", "lat": 33.69, "lng": 73.04, "color": "#EC4899"},
    {"id": 35, "name": "Gorgon Group", "origin": "Pakistan", "targets": "Gov, Crypto", "description": "Mix of espionage and cybercrime operations.", "lat": 33.72, "lng": 73.01, "color": "#EC4899"},
    {"id": 36, "name": "Equation Group", "origin": "USA", "targets": "Global, Telecom", "description": "NSA-linked, most sophisticated known threat actor.", "lat": 38.88, "lng": -77.02, "color": "#6366F1"},
    {"id": 37, "name": "Longhorn", "origin": "USA", "targets": "Intel, Gov", "description": "CIA-linked toolset exposed in Vault 7 leaks.", "lat": 38.95, "lng": -77.15, "color": "#6366F1"},
    {"id": 38, "name": "Unit 8200", "origin": "Israel", "targets": "Middle East", "description": "Israeli military intelligence SIGINT unit.", "lat": 32.09, "lng": 34.77, "color": "#14B8A6"},
    {"id": 39, "name": "BlackCube", "origin": "Israel", "targets": "Corporate", "description": "Private intelligence firm with state ties.", "lat": 32.07, "lng": 34.80, "color": "#14B8A6"},
    {"id": 40, "name": "Dark Caracal", "origin": "Lebanon", "targets": "Mobile, Gov", "description": "Lebanese intelligence-linked mobile surveillance.", "lat": 33.89, "lng": 35.50, "color": "#F43F5E"},
    {"id": 41, "name": "SandCat", "origin": "Uzbekistan", "targets": "Human Rights", "description": "Uzbek intelligence targeting dissidents.", "lat": 41.31, "lng": 69.28, "color": "#8B5CF6"},
    {"id": 42, "name": "Promethium (StrongPity)", "origin": "Turkey", "targets": "Users", "description": "Turkish APT distributing trojanized software.", "lat": 39.93, "lng": 32.86, "color": "#EF4444"},
    {"id": 43, "name": "Machete", "origin": "Venezuela", "targets": "Military", "description": "Cyber espionage against Latin American militaries.", "lat": 10.49, "lng": -66.88, "color": "#F59E0B"},
    {"id": 44, "name": "Careto (The Mask)", "origin": "Spain", "targets": "Gov, Energy", "description": "Highly sophisticated, discovered by Kaspersky.", "lat": 40.42, "lng": -3.70, "color": "#3B82F6"},
    {"id": 45, "name": "Animal Farm", "origin": "France", "targets": "Syria, Iran", "description": "French intelligence-linked toolset.", "lat": 48.86, "lng": 2.35, "color": "#3B82F6"},
    {"id": 46, "name": "Regin", "origin": "United Kingdom", "targets": "EU, Belgacom", "description": "GCHQ-linked, targeted EU telecom providers.", "lat": 51.51, "lng": -0.13, "color": "#6366F1"},
    {"id": 47, "name": "Ghostwriter", "origin": "Belarus", "targets": "NATO, Poland", "description": "Disinformation and credential harvesting.", "lat": 53.90, "lng": 27.57, "color": "#EF4444"},
    {"id": 48, "name": "Red October", "origin": "Russia", "targets": "Diplomatic", "description": "Diplomatic espionage using spear-phishing.", "lat": 59.93, "lng": 30.32, "color": "#EF4444"},
    {"id": 49, "name": "DarkHotel", "origin": "South Korea", "targets": "Executives", "description": "Targets business executives in luxury hotels.", "lat": 37.57, "lng": 126.98, "color": "#06B6D4"},
    {"id": 50, "name": "Desert Falcons", "origin": "Egypt", "targets": "Military, Gov, Media", "description": "Middle Eastern APT targeting military and media.", "lat": 30.04, "lng": 31.24, "color": "#F59E0B"},
    {"id": 51, "name": "SilverTerrier", "origin": "Nigeria", "targets": "Financial, Global", "description": "BEC and financial fraud operations.", "lat": 6.52, "lng": 3.38, "color": "#F59E0B"},
    {"id": 52, "name": "Automated Libra", "origin": "South Africa", "targets": "Cloud Infra, DevOps", "description": "Cryptojacking and cloud infrastructure abuse.", "lat": -33.93, "lng": 18.42, "color": "#F59E0B"},
    {"id": 53, "name": "Longhorn (The Lamberts)", "origin": "United States", "targets": "Gov, Energy, Finance", "description": "Sophisticated toolset possibly linked to CIA.", "lat": 39.10, "lng": -76.77, "color": "#6366F1"},
    {"id": 54, "name": "CSEC (State Actor)", "origin": "Canada", "targets": "Global Intelligence", "description": "Canadian SIGINT operations.", "lat": 45.42, "lng": -75.70, "color": "#6366F1"},
    {"id": 55, "name": "Dark Tequila", "origin": "Mexico", "targets": "Financial, Corporate", "description": "Sophisticated banking malware in Latin America.", "lat": 19.43, "lng": -99.13, "color": "#F59E0B"},
    {"id": 56, "name": "Blind Eagle (APT-C-36)", "origin": "Colombia", "targets": "Gov, Financial", "description": "Targets government and financial in Andean region.", "lat": 4.71, "lng": -74.07, "color": "#F59E0B"},
    {"id": 57, "name": "Lapsus$", "origin": "Brazil", "targets": "Tech Giants, Telecom", "description": "Teenage hackers who breached Microsoft, Nvidia, Samsung.", "lat": -23.55, "lng": -46.63, "color": "#F59E0B"},
]


from typing import Optional

@router.get("/apt-groups")
async def get_apt_groups(origin: Optional[str] = None):
    """Return all APT groups, optionally filtered by origin country."""
    if origin:
        return [a for a in APT_GROUPS if a["origin"].lower() == origin.lower()]
    return APT_GROUPS


@router.get("/apt-groups/{apt_id}")
async def get_apt_group(apt_id: int):
    """Return a single APT group by ID."""
    for apt in APT_GROUPS:
        if apt["id"] == apt_id:
            return apt
    return {"error": "APT group not found"}


@router.get("/apt-stats")
async def get_apt_stats():
    """Return aggregate APT statistics by origin country."""
    from collections import Counter
    origins = Counter(a["origin"] for a in APT_GROUPS)
    return {
        "total_groups": len(APT_GROUPS),
        "by_origin": dict(origins.most_common()),
        "origins": list(origins.keys()),
    }

import asyncio
import socket

@router.get("/nmap-scan")
async def nmap_scan(ip: str):
    """
    Native Python implementation simulating Nmap TCP Connect scan.
    Does not require external nmap binaries.
    """
    ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 5432, 8080, 8443]
    
    async def scan_port(p):
        try:
            conn = asyncio.open_connection(ip, p)
            reader, writer = await asyncio.wait_for(conn, timeout=1.5)
            writer.close()
            await writer.wait_closed()
            
            try:
                service = socket.getservbyport(p)
            except:
                service = "unknown"
                
            return {"port": p, "state": "open", "service": service}
        except Exception:
            return None
            
    tasks = [scan_port(p) for p in ports]
    results = await asyncio.gather(*tasks)
    open_ports = [r for r in results if r is not None]
    
    return {
        "ip": ip,
        "status": "up" if open_ports else "unknown (icmp blocked?)",
        "open_ports": open_ports,
        "total_scanned": len(ports)
    }
