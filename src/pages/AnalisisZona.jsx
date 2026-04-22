import React, { useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiContext } from '../context/ApiContext';
import InfoCard from '../components/InfoCard/InfoCard';
import TrendChart from '../components/Chart/TrendChart';
import GaugeChart from '../components/Chart/GaugeChart';
import styles from './AnalisisZona.module.css';

const AnalisisZona = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { busesData, isLoading, error, selectedHour, setSelectedHour } = useContext(ApiContext);

  // 1. Obtener la información del bus específico
  const busInfo = busesData ? busesData[id] : null;

  // 2. Datos de la hora seleccionada (protección contra nulos)
  const currentHourData = useMemo(() => {
    return busInfo?.datosHorarios.find(d => d.hora === selectedHour) || busInfo?.datosHorarios[0] || {};
  }, [busInfo, selectedHour]);

  // 3. Lógica de Estado: Cálculo de promedio para determinar estado general
  const avgVoltage = useMemo(() => {
    const validVoltages = [currentHourData.v1, currentHourData.v2, currentHourData.v3]
      .filter(v => v !== null && v !== undefined);

    return validVoltages.length > 0 
      ? validVoltages.reduce((sum, v) => sum + v, 0) / validVoltages.length 
      : null;
  }, [currentHourData]);

  // 4. Configuración de límites y etiquetas para el eje Y
  const voltageLimits = useMemo(() => [
    { value: 1.06, color: '#e53935', label: 'Peligro (1.06)' },
    { value: 1.04, color: '#f57c00', label: 'Aviso (1.04)' },
    { value: 1.00, color: '#009999', label: 'Nominal (1.00)' },
    { value: 0.96, color: '#f57c00', label: 'Aviso (0.96)' },
    { value: 0.94, color: '#e53935', label: 'Peligro (0.94)' }
  ], []);

  const yAxisTicks = useMemo(() => [0.94, 0.96, 1.00, 1.04, 1.06], []);

  // Early returns AFTER all hooks
  if (isLoading || !busesData) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Cargando zona...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Error: {error}</h2>
        </div>
      </div>
    );
  }

  if (!busInfo) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <h2 className={styles.notFoundTitle}>Zona no encontrada</h2>
        </div>
        <div className={styles.notFoundContainer}>
          <button onClick={() => navigate('/')} className={styles.backButton}>
            ← VOLVER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Cabecera con navegación dentro del contenedor principal */}
      <div className={styles.header}>
        <button 
          onClick={() => navigate('/')} 
          className={styles.backButton}
        >
          ← VOLVER
        </button>
        <h1 className={styles.title}>
          Análisis Técnico: {busInfo.zona} 
          <span className={styles.busId}>(Bus {id})</span>
        </h1>
      </div>

      {/* Contenedor principal: KPIs a la izquierda y Gráfica al 100% a la derecha */}
      <div className={styles.mainContainer}>
        {/* Columna de KPIs (Gauges + Consumo) */}
        <div className={styles.kpiColumn}>
          <GaugeChart value={currentHourData.v1} title="Tensión Fase 1" noBorder={true} />
          <GaugeChart value={currentHourData.v2} title="Tensión Fase 2" noBorder={true} />
          <GaugeChart value={currentHourData.v3} title="Tensión Fase 3" noBorder={true} />
          <InfoCard 
            title="Consumo" 
            value={currentHourData.cargaTotal !== null && currentHourData.cargaTotal !== undefined
              ? `${currentHourData.cargaTotal.toFixed(2)} kW`
              : '--'
            } 
          />
        </div>

        {/* Columna de Gráfica */}
        <div className={styles.chartColumn}>
          <TrendChart 
            data={busInfo.datosHorarios}
            dataKeys={['v1', 'v2', 'v3']}
            colors={['#2196F3', '#4CAF50', '#9C27B0']}
            selectedHour={selectedHour}
            onSliderChange={setSelectedHour}
            yAxisLabel="Tensión (p.u.)"
            yAxisDomain={[0.92, 1.08]}
            yAxisTicks={yAxisTicks}
            yAxisDecimals={2}
            horizontalGuides={voltageLimits}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalisisZona;