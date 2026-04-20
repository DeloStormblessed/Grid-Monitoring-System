import React, { useState, useEffect, useMemo } from 'react';
import InfoCard from '../components/InfoCard/InfoCard';
import TrendChart from '../components/Chart/TrendChart';
import styles from './Dashboard.module.css';
import systemData from '../mocks/system.json';

const Dashboard = () => {
  const [selectedHour, setSelectedHour] = useState(0);
  const [weather, setWeather] = useState('Cargando...');

  useEffect(() => {
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
      } catch (error) {
        setWeather('Error API');
      }
    };
    fetchWeather();
  }, []);

  const currentData = useMemo(() => 
    systemData.find(item => item.hora === selectedHour) || systemData[0],
    [selectedHour]
  );

  const kpis = useMemo(() => {
    const weatherParts = weather.split(' | ');
    const climaValue = weatherParts.length === 2 ? (
      <>
        {weatherParts[0]}
        <br />
        {weatherParts[1]}
      </>
    ) : weather;

    return [
      { id: 1, title: 'Demanda Total', value: `${parseFloat(currentData.demandaTotalKw.toFixed(1)).toLocaleString('es-ES')} kW` },
      { id: 2, title: 'Pérdidas Totales', value: `${parseFloat(currentData.perdidasKw.toFixed(1)).toLocaleString('es-ES')} kW` },
      { id: 3, title: 'Zonas en Aviso', value: '0' },
      { id: 4, title: 'Clima (LPA)', value: climaValue }
    ];
  }, [currentData, weather]);



  return (
    <div className={styles.dashboardContainer}>
      
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <InfoCard key={kpi.id} title={kpi.title} value={kpi.value} />
        ))}
      </div>


      <TrendChart 
        title={`Curva de Demanda Total`}
        data={systemData}
        dataKey="demandaTotalKw"
        selectedHour={selectedHour}
        onSliderChange={setSelectedHour}
        color="#000"  
      />
    </div>
  );
};

export default Dashboard;