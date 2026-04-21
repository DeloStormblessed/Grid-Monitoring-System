import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InfoCard from '../components/InfoCard/InfoCard';
import TrendChart from '../components/Chart/TrendChart';
import busesData from '../mocks/buses.json';
import styles from './Dashboard.module.css'; // Reutilizamos el grid del Dashboard

const AnalisisZona = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedHour, setSelectedHour] = useState(0);

  // 1. Obtener la información del bus específico
  const busInfo = busesData[id];

  // 2. Datos de la hora seleccionada (protección contra nulos)
  const currentHourData = useMemo(() => {
    return busInfo?.datosHorarios.find(d => d.hora === selectedHour) || busInfo?.datosHorarios[0] || {};
  }, [busInfo, selectedHour]);

  // 3. Lógica de KPIs: Filtrado de nulos y cálculo de promedios
  const kpis = useMemo(() => {
    // Solo tomamos valores numéricos para el promedio
    const validVoltages = [currentHourData.v1, currentHourData.v2, currentHourData.v3]
      .filter(v => v !== null && v !== undefined);

    const avgVoltage = validVoltages.length > 0 
      ? validVoltages.reduce((sum, v) => sum + v, 0) / validVoltages.length 
      : null;

    const demanda = currentHourData.cargaTotal;

    return [
      { 
        id: 1, 
        title: 'Tensión Media', 
        value: avgVoltage !== null ? `${avgVoltage.toFixed(3)} p.u.` : 'Sin datos' 
      },
      { 
        id: 2, 
        title: 'Demanda del Bus', 
        value: (demanda !== null && demanda !== undefined) ? `${demanda.toFixed(1)} kW` : 'Sin datos' 
      },
      { 
        id: 3, 
        title: 'Factor de Potencia', 
        value: '0.96' // Placeholder solicitado
      },
      { 
        id: 4, 
        title: 'Estado', 
        value: avgVoltage === null 
          ? 'DESCONOCIDO' 
          : (avgVoltage < 0.94 || avgVoltage > 1.06) ? 'PELIGRO' : 'NOMINAL' 
      }
    ];
  }, [currentHourData]);

  if (!busInfo) {
    return (
      <div className={styles.dashboardContainer}>
        <h2>Zona no encontrada</h2>
        <button onClick={() => navigate('/')}>Volver al Dashboard</button>
      </div>
    );
  }

  // 4. Configuración de límites y etiquetas para el eje Y
  const voltageLimits = [
    { value: 1.06, color: '#d32f2f', label: 'Peligro (1.06)' },
    { value: 1.04, color: '#f57c00', label: 'Aviso (1.04)' },
    { value: 1.00, color: '#000',    label: 'Nominal (1.00)' },
    { value: 0.96, color: '#f57c00', label: 'Aviso (0.96)' },
    { value: 0.94, color: '#d32f2f', label: 'Peligro (0.94)' }
  ];

  const yAxisTicks = [0.94, 0.96, 1.00, 1.04, 1.06];

  return (
    <div className={styles.dashboardContainer}>
      
      {/* Cabecera con navegación */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            padding: '8px 16px', border: '2px solid #000', borderRadius: '20px', 
            cursor: 'pointer', fontWeight: 'bold', background: 'none' 
          }}
        >
          ← VOLVER
        </button>
        <h1 style={{ margin: 0 }}>
          Análisis Técnico: {busInfo.zona} 
          <span style={{ fontSize: '0.6em', color: '#666', marginLeft: '10px' }}>(Bus {id})</span>
        </h1>
      </div>

      {/* Bloque de KPIs */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <InfoCard key={kpi.id} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      {/* Gráfico de Tendencia Multi-fase */}
      <div style={{ marginTop: '30px', background: '#fff', padding: '10px', border: '1px solid #eee' }}>
        <TrendChart 
          data={busInfo.datosHorarios}
          dataKeys={['v1', 'v2', 'v3']} // Representación de Fase 1, 2 y 3
          colors={['#2196F3', '#4CAF50', '#9C27B0']} // Colores Fase 1, 2 y 3
          selectedHour={selectedHour}
          onSliderChange={setSelectedHour}
          yAxisLabel="Tensión (p.u.)"
          yAxisDomain={[0.90, 1.1]} // Margen para ver todas las líneas de corte
          yAxisTicks={yAxisTicks}
          horizontalGuides={voltageLimits}
        />
      </div>
      
    </div>
  );
};

export default AnalisisZona;