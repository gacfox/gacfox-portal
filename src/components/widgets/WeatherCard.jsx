import { useState, useEffect } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Cloudy,
  Wind,
  Thermometer,
} from "lucide-react";

const WEATHER_ICONS = {
  0: Sun,
  1: Sun,
  2: Cloudy,
  3: Cloudy,
  45: Cloud,
  48: Cloud,
  51: CloudRain,
  53: CloudRain,
  55: CloudRain,
  61: CloudRain,
  63: CloudRain,
  65: CloudRain,
  71: CloudSnow,
  73: CloudSnow,
  75: CloudSnow,
  77: CloudSnow,
  80: CloudRain,
  81: CloudRain,
  82: CloudRain,
  85: CloudSnow,
  86: CloudSnow,
  95: CloudLightning,
  96: CloudLightning,
  99: CloudLightning,
};

const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

const CACHE_DURATION = 6 * 60 * 60 * 1000;

function getCachedWeather() {
  const cached = localStorage.getItem("weather_data");
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  return null;
}

function setCachedWeather(data, latitude, longitude) {
  localStorage.setItem(
    "weather_data",
    JSON.stringify({
      data,
      timestamp: Date.now(),
      location: { latitude, longitude },
    }),
  );
}

async function fetchWeather(latitude, longitude) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,is_day,surface_pressure&timezone=${encodeURIComponent(timezone)}&forecast_days=1`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch weather");
  }

  const data = await response.json();
  setCachedWeather(data, latitude, longitude);
  return data;
}

function getWindDirection(degree) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degree / 45) % 8;
  return directions[index];
}

function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getWeather = async () => {
      try {
        const cached = getCachedWeather();
        if (cached) {
          setWeather(cached);
          setLoading(false);
          return;
        }

        if (!navigator.geolocation) {
          throw new Error("Geolocation not supported");
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const data = await fetchWeather(latitude, longitude);
            setWeather(data);
            setLoading(false);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          },
        );
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    getWeather();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="rounded-3xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10 p-6">
          <div className="animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div>
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
              </div>
            </div>
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return null;
  }

  const current = weather.current;
  const units = weather.current_units;
  const WeatherIcon = WEATHER_ICONS[current.weather_code] || Cloud;
  const weatherDesc = WEATHER_CODES[current.weather_code] || "Unknown";

  return (
    <div>
      <div className="rounded-3xl bg-white/15 dark:bg-slate-800/15 backdrop-blur-xl border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <WeatherIcon className="w-12 h-12 text-gray-800 dark:text-white" />
              {current.is_day === 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-400"></div>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-800 dark:text-white">
                  {Math.round(current.temperature_2m)}
                </span>
                <span className="text-xl text-gray-600 dark:text-gray-300">
                  {units.temperature_2m}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {weatherDesc}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <Thermometer className="w-4 h-4" />
              <span>体感 {Math.round(current.apparent_temperature)}℃</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="w-4 h-4" />
              <span>
                {current.wind_speed_10m} {units.wind_speed_10m}{" "}
                {getWindDirection(current.wind_direction_10m)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Cloud className="w-4 h-4" />
              <span>云量 {current.cloud_cover}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;
