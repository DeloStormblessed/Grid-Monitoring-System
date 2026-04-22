import React, { createContext, useState, useEffect } from 'react';
import systemMock from '../mocks/system.json';
import busesMock from '../mocks/buses.json';

export const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const [systemData, setSystemData] = useState([]);
  const [busesData, setBusesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Global states
  const [selectedHour, setSelectedHour] = useState(0);
  const [weather, setWeather] = useState('Cargando...');

  const fetchWeather = async () => {
    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.12&longitude=-15.43&current_weather=true');
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      if (data && data.current_weather) {
        const temp = data.current_weather.temperature.toString().replace('.', ',');
        const windspeed = data.current_weather.windspeed.toString().replace('.', ',');
        setWeather(`${temp}°C | ${windspeed} km/h`);
      }
    } catch (err) {
      setWeather('Error API');
    }
  };

  const fetchGridData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulating API call latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In the future, this will be:
      // const sysRes = await fetch('/api/system');
      // const sysData = await sysRes.json();
      
      setSystemData(systemMock);
      setBusesData(busesMock);
    } catch (err) {
      setError('Error al cargar datos de la red');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    fetchGridData();
  }, []);

  return (
    <ApiContext.Provider value={{
      systemData,
      busesData,
      isLoading,
      error,
      selectedHour,
      setSelectedHour,
      weather,
      fetchWeather,
      fetchGridData
    }}>
      {children}
    </ApiContext.Provider>
  );
};
