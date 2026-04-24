import api from './api';

export const fetchWeather = async ({ city, lat, lon }) => {
  let params = {};
  if (lat && lon) {
    params = { lat, lon };
  } else if (city) {
    params = { city };
  } else {
    throw new Error('Provide city or coordinates');
  }
  const res = await api.get('/weather', { params });
  return res.data.weather;
};
