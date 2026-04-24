const axios = require("axios");

const API_KEY = process.env.OPENWEATHER_API_KEY;

const BASE_URL =
  "https://api.openweathermap.org/data/2.5";

const getWeather = async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    // Validate API key
    if (!API_KEY) {
      return res.status(503).json({
        success: false,
        message:
          "OpenWeather API key not configured. Add it to server/.env",
      });
    }

    // Validate location
    if (!city && !(lat && lon)) {
      return res.status(400).json({
        success: false,
        message:
          "Provide city or lat/lon query params",
      });
    }

    // Build params safely
    const params = {
      appid: API_KEY,
      units: "metric",
    };

    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    } else {
      params.q = `${city},IN`;
    }

    // Fetch current weather
    const currentRes = await axios.get(
      `${BASE_URL}/weather`,
      {
        params,
        timeout: 5000,
      }
    );

    // Fetch forecast
    const forecastRes = await axios.get(
      `${BASE_URL}/forecast`,
      {
        params: {
          ...params,
          cnt: 40,
        },
        timeout: 5000,
      }
    );

    const current = currentRes.data;

    // SAFETY CHECK — prevents "not iterable"
    const forecastList = Array.isArray(
      forecastRes.data?.list
    )
      ? forecastRes.data.list
      : [];

    const dailyForecast = [];
    const seenDates = new Set();

    for (const item of forecastList) {
      const date = new Date(
        item.dt * 1000
      ).toLocaleDateString("en-IN");

      if (
        !seenDates.has(date) &&
        dailyForecast.length < 5
      ) {
        seenDates.add(date);

        dailyForecast.push({
          date,
          temp: Math.round(
            item.main.temp
          ),
          tempMin: Math.round(
            item.main.temp_min
          ),
          tempMax: Math.round(
            item.main.temp_max
          ),
          humidity:
            item.main.humidity,
          description:
            item.weather[0]
              .description,
          icon:
            item.weather[0].icon,
          windSpeed:
            item.wind.speed,
          rainfall: item.rain
            ? item.rain["3h"] || 0
            : 0,
        });
      }
    }

    const weatherData = {
      location: {
        city: current.name,
        country:
          current.sys.country,
        lat: current.coord.lat,
        lon: current.coord.lon,
      },

      current: {
        temp: Math.round(
          current.main.temp
        ),
        feelsLike: Math.round(
          current.main.feels_like
        ),
        tempMin: Math.round(
          current.main.temp_min
        ),
        tempMax: Math.round(
          current.main.temp_max
        ),
        humidity:
          current.main.humidity,
        pressure:
          current.main.pressure,
        visibility:
          current.visibility,
        windSpeed:
          current.wind.speed,
        windDeg:
          current.wind.deg,
        description:
          current.weather[0]
            .description,
        icon:
          current.weather[0].icon,
        cloudiness:
          current.clouds.all,
        rainfall: current.rain
          ? current.rain["1h"] || 0
          : 0,
        sunrise: new Date(
          current.sys.sunrise *
            1000
        ).toLocaleTimeString("en-IN"),
        sunset: new Date(
          current.sys.sunset *
            1000
        ).toLocaleTimeString("en-IN"),
      },

      forecast: dailyForecast,

      fetchedAt:
        new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      weather: weatherData,
    });

  } catch (error) {
    console.error(
      "Weather fetch error:",
      error.message
    );

    // City not found
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "City not found",
      });
    }

    // Invalid API key
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid OpenWeather API key",
      });
    }

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch weather data",
    });
  }
};

module.exports = {
  getWeather,
};