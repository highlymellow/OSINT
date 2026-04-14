export const KRG_BORDER = {
  type: "FeatureCollection",
  features: [{
    type: "Feature",
    properties: { name: "Kurdistan Regional Government (KRG)", type: "border" },
    geometry: {
      type: "LineString",
      coordinates: [
        [42.3, 37.1], [43.0, 36.8], [43.5, 36.6], [44.0, 36.2], [44.5, 35.8],
        [45.0, 35.4], [45.5, 35.0], [46.0, 34.6], [46.2, 34.2]
      ]
    }
  }]
};

export const ARTICLE_140 = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "Kirkuk", threat: "critical" }, geometry: { type: "Point", coordinates: [44.39, 35.47] } },
    { type: "Feature", properties: { name: "Sinjar", threat: "high" }, geometry: { type: "Point", coordinates: [41.87, 36.32] } },
    { type: "Feature", properties: { name: "Makhmur", threat: "medium" }, geometry: { type: "Point", coordinates: [43.68, 35.75] } },
    { type: "Feature", properties: { name: "Khanaqin", threat: "high" }, geometry: { type: "Point", coordinates: [45.38, 34.35] } },
    { type: "Feature", properties: { name: "Tuz Khurmatu", threat: "critical" }, geometry: { type: "Point", coordinates: [44.63, 34.88] } }
  ]
};

export const HOT_ZONES = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { level: "critical", intensity: 0.8 }, geometry: { type: "Point", coordinates: [44.4, 33.3] } }, // Baghdad
    { type: "Feature", properties: { level: "severe", intensity: 0.6 }, geometry: { type: "Point", coordinates: [44.39, 35.47] } }, // Kirkuk
    { type: "Feature", properties: { level: "high", intensity: 0.5 }, geometry: { type: "Point", coordinates: [43.13, 36.34] } }, // Mosul
    { type: "Feature", properties: { level: "moderate", intensity: 0.3 }, geometry: { type: "Point", coordinates: [47.78, 30.51] } } // Basra
  ]
};

export const CLIMATE_SECURITY = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { risk: "Water Scarcity", value: 90 }, geometry: { type: "Point", coordinates: [46.5, 31.0] } }, // Southern Marshes Drought
    { type: "Feature", properties: { risk: "Desertification", value: 85 }, geometry: { type: "Point", coordinates: [42.0, 33.0] } }, // Anbar desertification
    { type: "Feature", properties: { risk: "Dam Water Level Drop", value: 70 }, geometry: { type: "Point", coordinates: [42.8, 36.6] } } // Mosul Dam
  ]
};
