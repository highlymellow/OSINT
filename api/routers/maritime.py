from fastapi import APIRouter
from typing import List
import time
import random

router = APIRouter()

# Realistic global chokepoints for simulated intelligence overlay
CHOKEPOINTS = [
    {"name": "Strait of Hormuz", "lat": 26.56, "lng": 56.25},
    {"name": "Bab el-Mandeb (Red Sea)", "lat": 12.58, "lng": 43.33},
    {"name": "Malacca Strait", "lat": 4.19, "lng": 100.43},
    {"name": "Taiwan Strait", "lat": 24.80, "lng": 119.90},
    {"name": "Black Sea (Grain Corridor)", "lat": 43.40, "lng": 34.00}
]

def generate_fleet(base_point, count=5):
    fleet = []
    for i in range(count):
        # Create organic clustering around the chokepoint
        lat_offset = random.uniform(-1.5, 1.5)
        lng_offset = random.uniform(-1.5, 1.5)
        
        types = ["Oil Tanker", "LNG Carrier", "Bulk Carrier", "Military Frigate", "Research Vessel"]
        v_type = random.choice(types)
        
        # Military frigates are flagged with an anomaly state for visual threat mapping
        is_military = v_type == "Military Frigate"
        
        fleet.append({
            "mmsi": f"413{random.randint(100000, 999999)}",
            "name": f"VESSEL-{random.randint(1000, 9999)}",
            "type": v_type,
            "lat": base_point["lat"] + lat_offset,
            "lng": base_point["lng"] + lng_offset,
            "speed": random.uniform(5.0, 22.0),
            "heading": random.uniform(0, 360),
            "is_military": is_military,
            "anomaly": "DARK_SHIP" if is_military and random.random() > 0.7 else None
        })
    return fleet

@router.get("/live")
async def get_maritime_telemetry():
    """
    Returns live maritime AIS telemetry (currently simulated for major tactical chokepoints).
    Can be replaced with raw aisstream.io WS socket dump in production.
    """
    ships = []
    for choke in CHOKEPOINTS:
        ships.extend(generate_fleet(choke, count=random.randint(4, 12)))
        
    return {
        "timestamp": int(time.time()),
        "vessels": ships,
        "total": len(ships)
    }
