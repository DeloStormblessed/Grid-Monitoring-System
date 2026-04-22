import React, { useContext, useMemo } from 'react';
import { ApiContext } from '../context/ApiContext';
import InfoCard from '../components/InfoCard/InfoCard';
import TrendChart from '../components/Chart/TrendChart';
import ZonesTable from '../components/ZonesTable/ZonesTable';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { 
    systemData, 
    busesData, 
    isLoading, 
    error, 
    selectedHour, 
    setSelectedHour, 
    weather 
  } = useContext(ApiContext);

  // Declarar TODOS los hooks primero (antes de cualquier return condicional)
  const currentData = useMemo(() => {
    if (!systemData || systemData.length === 0) return null;
    return systemData.find(item => item.hora === selectedHour) || systemData[0];
  }, [systemData, selectedHour]);

  const atRiskZones = useMemo(() => {
    if (!busesData) return [];
    return Object.entries(busesData)
      .map(([id, info]) => {
        const hourData = info.datosHorarios.find(d => d.hora === selectedHour) || {};
        const voltages = [hourData.v1, hourData.v2, hourData.v3].filter(v => v != null);
        
        let colorClass = null;
        let priority = 3;

        voltages.forEach(v => {
          if (v <= 0.94 || v >= 1.06) {
            colorClass = styles.statusDanger;
            priority = 1;
          } else if ((v <= 0.96 || v >= 1.04) && priority > 1) {
            colorClass = styles.statusWarning;
            priority = 2;
          }
        });

        return { id, nombre: info.zona, colorClass, priority };
      })
      .filter(z => z.priority < 3)
      .sort((a, b) => a.priority - b.priority);
  }, [busesData, selectedHour]);

  const kpis = useMemo(() => {
    const weatherParts = weather.split(' | ');
    const climaValue = weatherParts.length === 2 ? (
      <div className={styles.multiLineKpi}>
        <span>{weatherParts[0]}</span>
        <span className={styles.separator}>|</span>
        <span>{weatherParts[1]}</span>
      </div>
    ) : weather;

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

    if (!currentData) {
      return [
        { id: 1, title: 'Estado de Zonas', value: zonesDisplay, status: zoneStatus },
        { id: 2, title: 'Demanda Total', value: '--' },
        { id: 3, title: 'Pérdidas Totales', value: '--' },
        { id: 4, title: 'Clima (LPA)', value: climaValue }
      ];
    }

    return [
      { id: 1, title: 'Estado de Zonas', value: zonesDisplay, status: zoneStatus },
      { id: 2, title: 'Demanda Total', value: `${parseFloat(currentData.demandaTotalKw.toFixed(1)).toLocaleString('es-ES')} kW` },
      { id: 3, title: 'Pérdidas Totales', value: `${parseFloat(currentData.perdidasKw.toFixed(1)).toLocaleString('es-ES')} kW` },
      { id: 4, title: 'Clima (LPA)', value: climaValue }
    ];
  }, [currentData, weather, atRiskZones]);

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