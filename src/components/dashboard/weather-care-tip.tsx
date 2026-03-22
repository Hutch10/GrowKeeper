"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  humidity: number;
  condition: string;
  icon: string;
}

interface CareTip {
  message: string;
  type: "watering" | "light" | "humidity" | "general";
  emoji: string;
}

function getCareTips(weather: WeatherData): CareTip[] {
  const tips: CareTip[] = [];

  // Temperature-based tips
  if (weather.temp > 30) {
    tips.push({
      message: "Hot day! Plants may need extra water. Check soil moisture.",
      type: "watering",
      emoji: "🌡️",
    });
  } else if (weather.temp < 10) {
    tips.push({
      message: "Cold weather. Reduce watering and keep plants away from drafts.",
      type: "watering",
      emoji: "❄️",
    });
  }

  // Humidity-based tips
  if (weather.humidity < 40) {
    tips.push({
      message: "Low humidity. Consider misting tropical plants or using a humidifier.",
      type: "humidity",
      emoji: "💨",
    });
  } else if (weather.humidity > 80) {
    tips.push({
      message: "High humidity. Watch for fungal issues and reduce misting.",
      type: "humidity",
      emoji: "💧",
    });
  }

  // Condition-based tips
  if (weather.condition.toLowerCase().includes("sun") || weather.condition.toLowerCase().includes("clear")) {
    tips.push({
      message: "Sunny day! Great time for photosynthesis. Rotate plants for even growth.",
      type: "light",
      emoji: "☀️",
    });
  } else if (weather.condition.toLowerCase().includes("rain")) {
    tips.push({
      message: "Rainy day. Perfect time to collect rainwater for plants!",
      type: "general",
      emoji: "🌧️",
    });
  } else if (weather.condition.toLowerCase().includes("cloud")) {
    tips.push({
      message: "Cloudy day. Move light-loving plants closer to windows.",
      type: "light",
      emoji: "☁️",
    });
  }

  // Default tip if none apply
  if (tips.length === 0) {
    tips.push({
      message: "Great day for plant care! Check your tasks and enjoy your garden.",
      type: "general",
      emoji: "🌿",
    });
  }

  return tips;
}

export function WeatherCareTip() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 300000, // 5 minutes cache
          });
        });

        const { latitude, longitude } = position.coords;

        // Fetch weather from Open-Meteo (free, no API key needed)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`
        );

        if (!response.ok) throw new Error("Weather fetch failed");

        const data = await response.json();

        // Map weather code to condition
        const weatherCodes: Record<number, string> = {
          0: "Clear sky",
          1: "Mainly clear",
          2: "Partly cloudy",
          3: "Overcast",
          45: "Foggy",
          48: "Foggy",
          51: "Light drizzle",
          61: "Light rain",
          63: "Rain",
          65: "Heavy rain",
          71: "Light snow",
          73: "Snow",
          80: "Rain showers",
          95: "Thunderstorm",
        };

        setWeather({
          temp: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          condition: weatherCodes[data.current.weather_code] || "Unknown",
          icon: data.current.weather_code <= 3 ? "☀️" : "☁️",
        });

        // Get location name
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          setLocationName(geoData.address?.city || geoData.address?.town || "");
        }
      } catch (err) {
        if (err instanceof GeolocationPositionError) {
          setError("Location access denied");
        } else {
          setError("Could not fetch weather");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return null; // Silently hide if weather unavailable
  }

  const tips = getCareTips(weather);
  const mainTip = tips[0];

  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-blue-50 to-green-50 p-4 dark:border-slate-700 dark:from-blue-900/20 dark:to-green-900/20">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm dark:bg-slate-800">
          {mainTip.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span>{weather.temp}°C</span>
            <span>•</span>
            <span>{weather.humidity}% humidity</span>
            {locationName && (
              <>
                <span>•</span>
                <span>{locationName}</span>
              </>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
            {mainTip.message}
          </p>
        </div>
      </div>
    </div>
  );
}
