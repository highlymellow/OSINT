"""
MERIDIAN OSINT Platform — Pulse API Router (Economic / Infrastructure)

This router provides telemetry on the underlying economic and infrastructural
health of the region, including oil dynamics, investment grading, and trade flows.
"""
from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

# ──────────────────────────────────────────────────────────────────────────────
# Economic Indicators Baseline
# ──────────────────────────────────────────────────────────────────────────────
economic_indicators = [
  {"name": "Oil Production", "value": "4.58M bbl/day", "change": "+1.2%", "trend": "up"},
  {"name": "USD/IQD Rate", "value": "1,310", "change": "-0.3%", "trend": "down"},
  {"name": "CPI Inflation", "value": "4.8%", "change": "+0.2%", "trend": "up"},
  {"name": "GDP Growth (est.)", "value": "3.1%", "change": "+0.4%", "trend": "up"},
  {"name": "Fed. Budget Exec.", "value": "62%", "change": "+8%", "trend": "up"},
  {"name": "Unemployment", "value": "16.2%", "change": "-0.5%", "trend": "down"},
]
]

# ──────────────────────────────────────────────────────────────────────────────
# Strategic Energy & Commodity Metrics
# ──────────────────────────────────────────────────────────────────────────────
energy_sector_data = [
  {"metric": "Oil Production", "value": "4.58M bbl/day", "target": "OPEC: 4.431M", "status": "Above Quota"},
  {"metric": "Brent Crude", "value": "$78.42", "change": "+1.2%", "status": "Ascending"},
  {"metric": "KRI Exports", "value": "Halted", "detail": "Pipeline dispute", "status": "Offline"},
  {"metric": "Gas Flaring", "value": "17.8 BCM/yr", "detail": "↓ 3% YoY", "status": "Improving"},
]
]

# ──────────────────────────────────────────────────────────────────────────────
# Municipal Investment Risk Matrix
# ──────────────────────────────────────────────────────────────────────────────
# Combines political risk, physical risk, and economic stability per governorate.
investment_risks = [
  {"gov": "Erbil", "risk": 35, "grade": "B+", "sector": "Real Estate, Oil"},
  {"gov": "Basra", "risk": 42, "grade": "B", "sector": "Energy, Port"},
  {"gov": "Baghdad", "risk": 58, "grade": "C+", "sector": "Banking, Telecom"},
  {"gov": "Sulaymaniyah", "risk": 38, "grade": "B+", "sector": "Tourism, Agri"},
  {"gov": "Najaf", "risk": 30, "grade": "A-", "sector": "Religious Tourism"},
  {"gov": "Kirkuk", "risk": 78, "grade": "D-", "sector": "Oil (Tri-Ethnic)"},
  {"gov": "Tuz Khurmatu", "risk": 74, "grade": "D", "sector": "Agri (Turkmen)"},
  {"gov": "Tal Afar", "risk": 66, "grade": "C-", "sector": "Trade (Turkmen)"},
  {"gov": "Nineveh", "risk": 65, "grade": "C-", "sector": "Reconstruction"},
]
]

# ──────────────────────────────────────────────────────────────────────────────
# International Trade Correlations
# ──────────────────────────────────────────────────────────────────────────────
trade_flows = [
  {"country": "China", "volume": "$12.8B", "type": "Import", "pct": 28},
  {"country": "India", "volume": "$8.9B", "type": "Export", "pct": 22},
  {"country": "Turkey", "volume": "$7.2B", "type": "Import", "pct": 16},
  {"country": "Iran", "volume": "$5.8B", "type": "Import", "pct": 13},
  {"country": "S. Korea", "volume": "$4.1B", "type": "Export", "pct": 10},
]

# ──────────────────────────────────────────────────────────────────────────────
# API Endpoints
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/economic-indicators", description="Top-level economic health parameters.", tags=["pulse"])
async def get_economic_indicators():
    """Returns vital macroeconomic indicators like inflation and exchange rates."""
    return economic_indicators

@router.get("/energy-sector", description="Oil, Gas, and Power generation statistics.", tags=["pulse"])
async def get_energy_sector():
    """Returns daily/monthly metrics for the energy infrastructure, including OPEC quota deviance."""
    return energy_sector_data

@router.get("/investment-risks", description="Geospatial investment risk grades.", tags=["pulse"])
async def get_investment_risks():
    """Returns composite risk profiles broken down by specific investor sectors (e.g. Oil, Real Estate)."""
    return investment_risks

@router.get("/trade-flows", description="Bilateral trade volumes with neighboring nations.", tags=["pulse"])
async def get_trade_flows():
    """Returns import/export trade distributions by foreign power."""
    return trade_flows
