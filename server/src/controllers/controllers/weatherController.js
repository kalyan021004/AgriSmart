const axios = require('axios');

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * GET /api/weather?city=Chennai
 * GET /api/weather?lat=13.08&lon=80.27
 * Returns current weather + 5-day forecast
 */
const getWeather = async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    if (!API_KEY || API_KEY === 'your_openweather_api_key_here') {
      return res.status(503).json({
        success: false,
        message: 'OpenWeather API key not configured. Add it to server/.env',
      });
    }

    let locationParam;
    if (lat && lon) {
      locationParam = `lat=${lat}&lon=${lon}`;
    } else if (city) {
      locationParam = `q=${encodeURIComponent(city)},IN`;
    } else {
      return res.status(400).json({ success: false, message: 'Provide city or lat/lon query params' });
    }

    // Fetch current weather
    const currentRes = await axios.get(
      `${BASE_URL}/weather?${locationParam}&appid=${API_KEY}&units=metric`
    );

    // Fetch 5-day forecast (every 3 hours)
    const forecastRes = await axios.get(
      `${BASE_URL}/forecast?${locationParam}&appid=${API_KEY}&units=metric&cnt=40`
    );

    const current = currentRes.data;
    const forecastList = forecastRes.data.list;

    // Group forecast by day (take one reading per day at ~noon)
    const dailyForecast = [];
    const seenDates = new Set();
    for (const item of forecastList) {
      const date = new Date(item.dt * 1000).toLocaleDateString('en-IN');
      if (!seenDates.has(date) && dailyForecast.length < 5) {
        seenDates.add(date);
        dailyForecast.push({
          date,
          temp: Math.round(item.main.temp),
          tempMin: Math.round(item.main.temp_min),
          tempMax: Math.round(item.main.temp_max),
          humidity: item.main.humidity,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          windSpeed: item.wind.speed,
          rainfall: item.rain ? item.rain['3h'] || 0 : 0,
        });
      }
    }

    const weatherData = {
      location: {
        city: current.name,
        country: current.sys.country,
        lat: current.coord.lat,
        lon: current.coord.lon,
      },
      current: {
        temp: Math.round(current.main.temp),
        feelsLike: Math.round(current.main.feels_like),
        tempMin: Math.round(current.main.temp_min),
        tempMax: Math.round(current.main.temp_max),
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        visibility: current.visibility,
        windSpeed: current.wind.speed,
        windDeg: current.wind.deg,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        cloudiness: current.clouds.all,
        rainfall: current.rain ? current.rain['1h'] || 0 : 0,
        sunrise: new Date(current.sys.sunrise * 1000).toLocaleTimeString('en-IN'),
        sunset: new Date(current.sys.sunset * 1000).toLocaleTimeString('en-IN'),
      },
      forecast: dailyForecast,
      fetchedAt: new Date().toISOString(),
    };

    res.status(200).json({ success: true, weather: weatherData });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }
    if (error.response?.status === 401) {
      return res.status(401).json({ success: false, message: 'Invalid OpenWeather API key' });
    }
    console.error('Weather fetch error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch weather data' });
  }
};

module.exports = { getWeather };
