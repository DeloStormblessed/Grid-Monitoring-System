import React, { useState, useEffect, useMemo } from 'react';
import InfoCard from '../components/InfoCard/InfoCard';
import TrendChart from '../components/Chart/TrendChart';
import ZonesTable from '../components/ZonesTable/ZonesTable';
import styles from './Dashboard.module.css';
import systemData from '../mocks/system.json';
import busesData from '../mocks/buses.json';

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

  // Lógica para calcular estados y filtrar solo los que están en riesgo (Aviso/Peligro)
  const atRiskZones = useMemo(() => {
    return Object.entries(busesData)
      .map(([id, info]) => {
        const hourData = info.datosHorarios.find(d => d.hora === selectedHour) || {};
        const voltages = [hourData.v1, hourData.v2, hourData.v3].filter(v => v != null);
        
        let color = null;
        let priority = 3; // 3: Nominal, 2: Aviso, 1: Peligro

        voltages.forEach(v => {
          if (v <= 0.94 || v >= 1.06) {
            color = '#d32f2f'; // Rojo
            priority = 1;
          } else if ((v <= 0.96 || v >= 1.04) && priority > 1) {
            color = '#f57c00'; // Naranja
            priority = 2;
          }
        });

        return { id, nombre: info.zona, color, priority };
      })
      .filter(z => z.priority < 3) // Solo nos quedamos con Peligro y Aviso
      .sort((a, b) => a.priority - b.priority); // Ordenar de Rojo a Naranja
  }, [selectedHour]);

  const kpis = useMemo(() => {
    const weatherParts = weather.split(' | ');
    const climaValue = weatherParts.length === 2 ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', lineHeight: '1.05' }}>
        <span>{weatherParts[0]}</span>
        <span>{weatherParts[1]}</span>
      </div>
    ) : weather;

    // Renderizado dinámico del contenido de la tarjeta de estados
    const dangerZones = atRiskZones.filter(z => z.priority === 1).length;
    const warningZones = atRiskZones.filter(z => z.priority === 2).length;
    const zonesParts = [];

    if (dangerZones > 0) {
      zonesParts.push({ value: dangerZones, label: 'Peligro', color: '#d32f2f' });
    }

    if (warningZones > 0) {
      zonesParts.push({ value: warningZones, label: 'Aviso', color: '#f57c00' });
    }
    
    const zonesDisplay = atRiskZones.length === 0 ? (
      <span style={{ color: '#388e3c', fontSize: '2.5rem', fontWeight: 'bold' }}>NOMINAL</span>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', lineHeight: '1.05', alignItems: 'center' }}>
        {zonesParts.map((zone) => (
          <div key={zone.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', lineHeight: '1' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: zone.color, lineHeight: '1', minWidth: '40px' }}>
              {zone.value}
            </span>
            <span style={{ fontSize: '1rem', color: zone.color, fontWeight: '600', textTransform: 'uppercase', lineHeight: '1' }}>
              {zone.label}
            </span>
          </div>
        ))}
      </div>
    );

    return [
      { id: 1, title: 'Demanda Total', value: `${parseFloat(currentData.demandaTotalKw.toFixed(1)).toLocaleString('es-ES')} kW` },
      { id: 2, title: 'Pérdidas Totales', value: `${parseFloat(currentData.perdidasKw.toFixed(1)).toLocaleString('es-ES')} kW` },
      { id: 3, title: 'Estado de Zonas', value: zonesDisplay },
      { id: 4, title: 'Clima (LPA)', value: climaValue }
    ];
  }, [currentData, weather, atRiskZones]);

// src/pages/Dashboard.jsx
  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Curva de demanda: Modelo tipo</h1>
      </div>

      <div className={styles.dashboardContainer}>
        {/* Columna Izquierda: KPIs */}
        <div className={styles.kpiColumn}>
          {kpis.map((kpi) => (
            <InfoCard key={kpi.id} title={kpi.title} value={kpi.value} />
          ))}
        </div>

        <div className={styles.contentColumn}>
          {/* Columna Central: Gráfico (65%) */}
          <div className={styles.chartColumn}>
            <TrendChart 
              title={`Curva de Demanda Total`}
              data={systemData}
              dataKey="demandaTotalKw"
              selectedHour={selectedHour}
              onSliderChange={setSelectedHour}
              color="#000"  
              showLegend={false}
            />
          </div>

          {/* Columna Derecha: Tabla (35%) */}
          <div className={styles.tableColumn}>
            <ZonesTable selectedHour={selectedHour} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;