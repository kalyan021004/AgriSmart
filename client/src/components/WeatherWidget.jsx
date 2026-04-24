import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { fetchWeather } from '../services/weatherService';
import { useAuth } from '../context/AuthContext';

const weatherIconMap = {
  '01d': '☀️', '01n': '🌙',
  '02d': '⛅', '02n': '☁️',
  '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️',
  '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
};

export default function WeatherWidget() {
  const { dbUser } = useAuth();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const city = dbUser?.farmerProfile?.district || 'Chennai';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchWeather({ city });
        setWeather(data);
      } catch (err) {
        setError(err.message || 'Failed to load weather');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [city]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 10, color: 'var(--text-muted)' }}>
      <div className="spinner" /> Loading weather...
    </div>
  );

  if (error) return (
    <div style={{ padding: 20, color: 'var(--alert-red)', fontSize: 14 }}>
      ⚠️ {error}
      <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 12 }}>
        Check your OpenWeather API key in server/.env
      </p>
    </div>
  );

  const icon = weatherIconMap[weather.current.icon] || '🌤️';

  return (
    <div>
      {/* Current weather */}
      <div className="weather-main">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52 }}>{icon}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {weather.current.description}
          </div>
        </div>
        <div className="weather-info">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            <div className="weather-temp-big">{weather.current.temp}</div>
            <div className="weather-temp-unit">°C</div>
          </div>
          <div className="weather-desc">{weather.location.city}, {weather.location.country}</div>
          <div className="weather-location">
            📍 {dbUser?.farmerProfile?.district || 'Auto-detected location'}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="weather-stats-row">
        <div className="weather-stat">
          <div className="weather-stat-label">Humidity</div>
          <div className="weather-stat-value">{weather.current.humidity}%</div>
        </div>
        <div className="weather-stat">
          <div className="weather-stat-label">Wind</div>
          <div className="weather-stat-value">{weather.current.windSpeed} m/s</div>
        </div>
        <div className="weather-stat">
          <div className="weather-stat-label">Rainfall</div>
          <div className="weather-stat-value">{weather.current.rainfall} mm</div>
        </div>
      </div>

      {/* 5-day forecast chart */}
      {weather.forecast?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            5-Day Forecast
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={weather.forecast} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#52b788" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#52b788" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }}
                formatter={(val) => [`${val}°C`, 'Temp']}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#52b788"
                strokeWidth={2}
                fill="url(#tempGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Forecast cards */}
          <div className="forecast-row" style={{ marginTop: 12 }}>
            {weather.forecast.map((day, i) => (
              <div className="forecast-item" key={i}>
                <div className="forecast-date">{day.date.split('/').slice(0, 2).join('/')}</div>
                <div className="forecast-icon">{weatherIconMap[day.icon] || '🌤️'}</div>
                <div className="forecast-temp">{day.temp}°</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{day.humidity}%💧</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
