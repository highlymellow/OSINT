from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

conflict_forecasts = [
  {"id": "F-001", "region": "Kirkuk", "scenario": "Arab-Kurd-Turkmen Escalation", "probability": 0.72, "horizon": "7-day", "drivers": ["PMF repositioning in Laylan", "KDP-Baghdad oil revenue dispute", "Turkmen ITC protest mobilization"], "stiAxis": "Arab-Kurd-Turkmen", "confidence": 0.84, "trend": "rising", "impact": "high"},
  {"id": "F-002", "region": "Diyala", "scenario": "Sectarian Displacement Wave", "probability": 0.58, "horizon": "14-day", "drivers": ["Sunni farmland seizures near Muqdadiyah", "Asa'ib Ahl al-Haq checkpoint expansion", "Water shortage displacement"], "stiAxis": "Sunni-Shia", "confidence": 0.76, "trend": "stable", "impact": "critical"},
  {"id": "F-003", "region": "Basra", "scenario": "Intra-Shia Factional Clashes", "probability": 0.45, "horizon": "30-day", "drivers": ["Port revenue redistribution dispute", "Sadrist vs Coordination Framework local elections", "Iranian consulate protest"], "stiAxis": "Intra-Shia", "confidence": 0.69, "trend": "declining", "impact": "medium"},
  {"id": "F-004", "region": "Sinjar", "scenario": "Governance Vacuum Exploitation", "probability": 0.63, "horizon": "14-day", "drivers": ["PKK/YBS withdrawal deadline", "Yazidi return frustration", "Turkiye cross-border operations"], "stiAxis": "Ethno-Religious Minorities", "confidence": 0.72, "trend": "rising", "impact": "high"},
  {"id": "F-005", "region": "Sulaymaniyah", "scenario": "KDP-PUK Revenue Dispute Escalation", "probability": 0.38, "horizon": "30-day", "drivers": ["Budget allocation deadlock", "Dual Peshmerga command friction", "Civil servant salary delays"], "stiAxis": "KDP-PUK", "confidence": 0.81, "trend": "stable", "impact": "medium"},
  {"id": "F-006", "region": "Nineveh Plains", "scenario": "Minority Community Tension Spike", "probability": 0.51, "horizon": "7-day", "drivers": ["Shabak militia vs Assyrian community land dispute", "Babylon Brigade expansion in Hamdaniya", "Christian emigration surge"], "stiAxis": "Ethno-Religious Minorities", "confidence": 0.67, "trend": "rising", "impact": "high"},
]

displacement_predictions = [
  {"governorate": "Kirkuk", "currentIDPs": 42800, "predicted30d": 47200, "predicted90d": 53100, "risk": "high", "driver": "Sectarian + Land"},
  {"governorate": "Diyala", "currentIDPs": 38500, "predicted30d": 44100, "predicted90d": 51800, "risk": "critical", "driver": "Armed Conflict"},
  {"governorate": "Nineveh", "currentIDPs": 156000, "predicted30d": 149000, "predicted90d": 139000, "risk": "medium", "driver": "Return Flow"},
  {"governorate": "Anbar", "currentIDPs": 67200, "predicted30d": 64800, "predicted90d": 61200, "risk": "medium", "driver": "Climate + Water"},
  {"governorate": "Salah ad-Din", "currentIDPs": 31400, "predicted30d": 33100, "predicted90d": 35800, "risk": "high", "driver": "Security + Drought"},
  {"governorate": "Basra", "currentIDPs": 12800, "predicted30d": 15600, "predicted90d": 21400, "risk": "high", "driver": "Climate Crisis"},
]

scenario_models = [
  {"id": "SCN-A", "name": "Baseline — Status Quo", "description": "Current trajectory continues. Gradual sectarian normalization, with periodic spikes around elections and budget cycles.", "probability": 0.45, "stiProjection": [65, 63, 61, 59, 62, 64, 60, 58, 56, 55, 57, 54], "color": "#3A5A7C"},
  {"id": "SCN-B", "name": "Escalation — Regional Spillover", "description": "Iran-US tensions escalate.", "probability": 0.25, "stiProjection": [65, 68, 72, 76, 78, 82, 85, 83, 80, 79, 81, 84], "color": "#C13A1B"},
  {"id": "SCN-C", "name": "De-escalation — Grand Bargain", "description": "Baghdad-Erbil budget agreement.", "probability": 0.20, "stiProjection": [65, 62, 58, 54, 50, 47, 44, 42, 40, 38, 36, 35], "color": "#2D8B4E"},
  {"id": "SCN-D", "name": "Crisis — Climate Collapse", "description": "Severe drought summer 2026.", "probability": 0.10, "stiProjection": [65, 67, 70, 74, 79, 85, 88, 91, 89, 86, 84, 82], "color": "#D47B2A"},
]

@router.get("/conflict-forecasts")
async def get_conflict_forecasts():
    return conflict_forecasts

@router.get("/displacement-predictions")
async def get_displacement_predictions():
    return displacement_predictions

@router.get("/scenario-models")
async def get_scenario_models():
    return scenario_models
