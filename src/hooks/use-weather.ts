"use client";

import { useState, useEffect } from "react";
import { getWeatherData, WeatherData } from "@/app/actions/weather";

let cachedWeather: WeatherData | null = null;
let lastFetch = 0;
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

export function useWeather(location = "New York, NY") {
  const [data, setData] = useState<WeatherData | null>(cachedWeather);
  const [loading, setLoading] = useState(!cachedWeather);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const now = Date.now();
    if (cachedWeather && (now - lastFetch < CACHE_DURATION)) {
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const result = await getWeatherData(location);
        if (result.success) {
          cachedWeather = result.data;
          lastFetch = Date.now();
          setData(result.data);
        } else {
          setError(result.error || "Weather sync failed.");
        }
      } catch {
        setError("Failed to reach climate sensors.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  return { data, loading, error };
}
