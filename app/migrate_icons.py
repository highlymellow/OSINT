import os
import re

src_dir = "/Users/mb/Desktop/OSINT/app/src"

lucide_to_phosphor = {
    "Search": "MagnifyingGlass", "Bell": "Bell", "Globe": "GlobeHemisphereWest", "Globe2": "GlobeHemisphereWest", 
    "Clock": "Clock", "Crosshair": "Crosshair", "Orbit": "Planet", "Flame": "Fire", "Activity": "Activity", 
    "Play": "Play", "Pause": "Pause", "AlertTriangle": "Warning", "Info": "Info", "ExternalLink": "ArrowSquareOut", 
    "X": "X", "RadioTower": "Broadcast", "Anchor": "Anchor", "Satellite": "Satellite", "Camera": "Camera", 
    "Server": "HardDrives", "Radio": "SpeakerHifi", "Layers": "Stack", "Minus": "Minus", "Plus": "Plus", 
    "Locate": "Crosshair", "Maximize": "CornersOut", "Loader2": "CircleNotch", "Command": "Command", 
    "Fingerprint": "Fingerprint", "Workflow": "Graph", "ScanEye": "Eye", "CandlestickChart": "ChartBar", 
    "Cpu": "Cpu", "TerminalSquare": "Terminal", "TrendingUp": "TrendUp", "TrendingDown": "TrendDown", 
    "ArrowRight": "ArrowRight", "Database": "Database", "Network": "Graph", "ShieldAlert": "ShieldWarning", 
    "PlayCircle": "PlayCircle", "Menu": "List", "LayoutDashboard": "SquaresFour", "Newspaper": "Newspaper",
    "Zap": "Lightning", "Map": "Map", "Shield": "Shield", "Zap": "Lightning", "'lucide-react'": "'@/lib/icons'",
    "RefreshCw": "ArrowsClockwise", "RefreshCcw": "ArrowsCounterClockwise", "ChevronDown": "CaretDown",
    "ChevronUp": "CaretUp", "ChevronRight": "CaretRight", "ChevronLeft": "CaretLeft", "Link": "Link",
    "Users": "Users", "MapPin": "MapPin", "ArrowUpRight": "ArrowUpRight"
}

all_icons = set()

# Regex to catch single line and multiline imports
import_pattern = re.compile(r'import\s+\{([^}]+)\}\s+from\s+[\'"]lucide-react[\'"]')

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith(".tsx") or f.endswith(".ts"):
            filepath = os.path.join(root, f)
            with open(filepath, "r", encoding="utf-8") as file:
                content = file.read()
            
            matches = import_pattern.findall(content)
            if matches:
                for match in matches:
                    icons = [i.strip() for i in match.split(",") if i.strip()]
                    all_icons.update(icons)
                
                # Replace the import
                new_content = import_pattern.sub(r'import { \g<1> } from "@/lib/icons"', content)
                with open(filepath, "w", encoding="utf-8") as file:
                    file.write(new_content)

print(f"Collected icons: {list(all_icons)}")

mapping_file = "/Users/mb/Desktop/OSINT/app/src/lib/icons.ts"
with open(mapping_file, "w", encoding="utf-8") as file:
    file.write('export {\n')
    for icon in all_icons:
        mapped = lucide_to_phosphor.get(icon, icon)
        if mapped != icon:
            file.write(f'  {mapped} as {icon},\n')
        else:
            file.write(f'  {icon},\n')
    file.write('} from "@phosphor-icons/react";\n')

print("Migration complete!")
