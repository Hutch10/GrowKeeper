"use server";

export type WeatherAlertLevel = "frost" | "heat" | null;

export interface WeatherAlert {
  level: WeatherAlertLevel;
  temp_c: number;
  message: string;
  recommendation: string;
}

const FROST_THRESHOLD_C = 2;
const HEAT_THRESHOLD_C = 35;

async function fetchNWSTemp(lat: number, lon: number): Promise<number | null> {
  try {
    const pointRes = await fetch(
      `https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`,
      {
        headers: { "User-Agent": "(growkeeper.app, contact@growkeeper.app)" },
        next: { revalidate: 3600 },
      },
    );
    if (!pointRes.ok) return null;

    const pointData = await pointRes.json();
    const forecastUrl = pointData?.properties?.forecast;
    if (!forecastUrl) return null;

    const forecastRes = await fetch(forecastUrl, {
      headers: { "User-Agent": "(growkeeper.app, contact@growkeeper.app)" },
      next: { revalidate: 3600 },
    });
    if (!forecastRes.ok) return null;

    const forecastData = await forecastRes.json();
    const period = forecastData?.properties?.periods?.[0];
    if (!period) return null;

    const temp_c =
      period.temperatureUnit === "F"
        ? ((period.temperature - 32) * 5) / 9
        : period.temperature;

    return Math.round(temp_c * 10) / 10;
  } catch {
    return null;
  }
}

function isUSCoverage(lat: number, lon: number): boolean {
  const inCONUS = lat >= 24.39 && lat <= 49.38 && lon >= -124.84 && lon <= -66.88;
  const inAlaska = lat >= 51.21 && lat <= 71.35 && lon >= -179.14 && lon <= -129.97;
  const inHawaii = lat >= 18.91 && lat <= 22.23 && lon >= -160.24 && lon <= -154.80;
  return inCONUS || inAlaska || inHawaii;
}

export async function getPlantWeatherAlert(
  lat: number | null | undefined,
  lon: number | null | undefined,
): Promise<WeatherAlert | null> {
  if (lat == null || lon == null) return null;
  if (!isUSCoverage(lat, lon)) return null;

  const temp_c = await fetchNWSTemp(lat, lon);
  if (temp_c == null) return null;

  const temp_f = Math.round(temp_c * 9 / 5 + 32);

  if (temp_c <= FROST_THRESHOLD_C) {
    return {
      level: "frost",
      temp_c,
      message: `Frost warning: ${temp_c}°C (${temp_f}°F) forecast`,
      recommendation: "Move outdoor plants indoors or cover them tonight.",
    };
  }

  if (temp_c >= HEAT_THRESHOLD_C) {
    return {
      level: "heat",
      temp_c,
      message: `Heat warning: ${temp_c}°C (${temp_f}°F) forecast`,
      recommendation: "Move sensitive plants to shade and water deeply.",
    };
  }

  return null;
}
