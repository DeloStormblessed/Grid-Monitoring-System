import React, { useMemo } from 'react';
import { useGridData } from '../hooks/hook';
import InfoCard from '../components/InfoCard/InfoCard';
import TrendChart from '../components/Chart/TrendChart';
import ZonesTable from '../components/ZonesTable/ZonesTable';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { 
    systemData, 
    isLoading, 
    error, 
    selectedHour, 
    setSelectedHour, 
    weather,
    currentSystemData,
    getAtRiskZones,
    formatWeather
  } = useGridData();

  // Declarar TODOS los hooks primero (antes de cualquier return condicional)
  const atRiskZones = useMemo(() => {
    return getAtRiskZones({
      statusDanger: styles.statusDanger,
      statusWarning: styles.statusWarning
    });
  }, [systemData, selectedHour]);

  const kpis = useMemo(() => {
    const weatherFormatted = formatWeather();
    const climaValue = weatherFormatted.isMultiline ? (
      <div className={styles.multiLineKpi}>
        <span>{weatherFormatted.parts[0]}</span>
        <span className={styles.separator}>|</span>
        <span>{weatherFormatted.parts[1]}</span>
      </div>
    ) : weatherFormatted.value;

    const dangerZones = atRiskZones.filter(z => z.priority === 1).length;
    const warningZones = atRiskZones.filter(z => z.priority === 2).length;
    const zonesParts = [];

    let zoneStatus = 'nominal';
    if (dangerZones > 0) {
      zoneStatus = 'danger';
    } else if (warningZones > 0) {
      zoneStatus = 'warning';
    }

    if (dangerZones > 0) {
      zonesParts.push({ value: dangerZones, label: 'Peligro', colorClass: styles.statusDanger });
    }

    if (warningZones > 0) {
      zonesParts.push({ value: warningZones, label: 'Aviso', colorClass: styles.statusWarning });
    }
    
    const zonesDisplay = atRiskZones.length === 0 ? (
      <span className={styles.statusNominal}>NOMINAL</span>
    ) : (
      <div className={styles.multiLineKpi}>
        {zonesParts.map((zone, index) => (
          <React.Fragment key={zone.label}>
            {index > 0 && <span className={styles.separator}>|</span>}
            <span className={zone.colorClass}>
              {zone.value} {zone.label}
            </span>
          </React.Fragment>
        ))}
      </div>
    );

    if (!currentSystemData) {
      return [
        { id: 1, title: 'Estado de Zonas', value: zonesDisplay, status: zoneStatus },
        { id: 2, title: 'Demanda Total', value: '--' },
        { id: 3, title: 'Pérdidas Totales', value: '--' },
        { id: 4, title: 'Clima (LPA)', value: climaValue }
      ];
    }

    return [
      { id: 1, title: 'Estado de Zonas', value: zonesDisplay, status: zoneStatus },
      { id: 2, title: 'Demanda Total', value: `${parseFloat(currentSystemData.demandaTotalKw.toFixed(1)).toLocaleString('es-ES')} kW` },
      { id: 3, title: 'Pérdidas Totales', value: `${parseFloat(currentSystemData.perdidasKw.toFixed(1)).toLocaleString('es-ES')} kW` },
      { id: 4, title: 'Clima (LPA)', value: climaValue }
    ];
  }, [currentSystemData, weather, atRiskZones]);

  // AHORA se pueden hacer los early returns
  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Cargando datos de la red...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Error: {error}</h1>
        </div>
      </div>
    );
  }

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
            <InfoCard 
              key={kpi.id} 
              title={kpi.title} 
              value={kpi.value}
              className={`${kpi.status ? styles[`glow${kpi.status.charAt(0).toUpperCase()}${kpi.status.slice(1)}`] : ''} ${kpi.title === 'Estado de Zonas' ? styles.noBorder : ''}`}
            />
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
              color="#009999"  
              showLegend={false}
              yAxisDecimals={0}
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