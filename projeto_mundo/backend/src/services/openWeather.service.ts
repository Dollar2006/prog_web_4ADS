import axios from 'axios';

export interface WeatherData {
  temperatura: number;
  descricao: string;
  icone: string;
  cidade: string;
  latitude: number;
  longitude: number;
}

// Cache em memória no backend
const weatherCache = new Map<string, WeatherData>();

export async function fetchWeatherByCityName(nomeCidade: string): Promise<WeatherData | null> {
  const key = nomeCidade.toLowerCase().trim();

  if (weatherCache.has(key)) return weatherCache.get(key)!;

  // No backend Node.js, usamos process.env em vez de import.meta.env
  const apiKey = process.env.OPENWEATHER_KEY; 
  if (!apiKey) {
    console.error("Erro: OPENWEATHER_KEY não configurada no ambiente do backend.");
    return null;
  }

  try {
    // Passo 1: Geocoding API (Nome da Cidade -> Lat/Lon)
    const geoResponse = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
      params: {
        q: nomeCidade,
        limit: 1,
        appid: apiKey
      }
    });

    const geoData = geoResponse.data;
    if (!geoData || geoData.length === 0) return null;

    const { lat, lon, name: cidadeNomeOficial } = geoData[0];

    // Passo 2: Weather API (Lat/Lon -> Dados do Clima)
    const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: String(lat),
        lon: String(lon),
        units: 'metric',
        lang: 'pt_br',
        appid: apiKey
      }
    });

    const weatherData = weatherResponse.data;

    const result: WeatherData = {
      temperatura: Math.round(weatherData.main.temp),
      descricao: weatherData.weather[0].description,
      icone: weatherData.weather[0].icon,
      cidade: cidadeNomeOficial,
      latitude: lat,
      longitude: lon
    };

    weatherCache.set(key, result);
    return result;
  } catch (error) {
    console.error("Erro ao buscar dados no OpenWeather:", error);
    return null;
  }
}