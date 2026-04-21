import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import busesData from '../../mocks/buses.json';
import styles from './ZonesTable.module.css';

// Función auxiliar para determinar el estado según el voltaje
const getVoltageState = (voltage) => {
  if (voltage === null || voltage === undefined) return { state: 'Desconocido', color: 'gray', priority: 4 };
  
  // Basado en el wireframe, < 0.94 o > 1.06 están en las zonas rojas del medidor
  if (voltage <= 0.94 || voltage >= 1.06) return { state: 'Peligro', styleClass: 'peligro', priority: 1 };
  if (voltage <= 0.96 || voltage >= 1.04) return { state: 'Aviso', styleClass: 'aviso', priority: 2 };
  
  return { state: 'Nominal', styleClass: 'nominal', priority: 3 };
};

const ZonesTable = ({ selectedHour }) => {
  const navigate = useNavigate();

  const tableData = useMemo(() => {
    const data = [];
    
    // Recorremos los buses (zonas) que nos llegan del JSON
    Object.entries(busesData).forEach(([busId, busInfo]) => {
      const hourData = busInfo.datosHorarios.find((d) => d.hora === selectedHour) || {};
      
      // Analizamos las fases (v1=A, v2=B, v3=C) para encontrar el peor caso
      const phases = [
          { name: '1', value: hourData.v1 },
          { name: '2', value: hourData.v2 },
          { name: '3', value: hourData.v3 }
      ];

      let worstState = { state: 'Nominal', styleClass: 'nominal', priority: 3 };
      let worstVoltage = null;
      let worstPhase = '';

      phases.forEach(phase => {
          if(phase.value !== null && phase.value !== undefined) {
              const stateInfo = getVoltageState(phase.value);
              if (stateInfo.priority < worstState.priority) {
                  worstState = stateInfo;
                  worstVoltage = phase.value;
                  worstPhase = phase.name;
              }
          }
      });

      // Si todo está correcto, tomamos la fase A por defecto para mostrar
      if (worstState.priority === 3) {
         const firstValidPhase = phases.find(p => p.value !== null);
         if (firstValidPhase) {
            worstVoltage = firstValidPhase.value;
            worstPhase = firstValidPhase.name;
         }
      }

      data.push({
        id: busId,
        zona: busInfo.zona,
        demanda: hourData.cargaTotal || 0,
        voltage: worstVoltage,
        fase: worstPhase,
        estado: worstState.state,
        styleClass: worstState.styleClass,
        priority: worstState.priority
      });
    });

    // Ordenamos: primero Peligro (1), luego Aviso (2) y por último Nominal (3)
    return data.sort((a, b) => a.priority - b.priority);
  }, [selectedHour]);

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Zona</th>
            <th>Nivel de tensión</th>
            <th>Demanda</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr key={row.id}>
              <td>
                <span className={styles.zonaName}>{row.zona}</span> <br/>
                <span className={styles.busId}>(bus {row.id})</span>
              </td>
              <td>{row.voltage !== null ? `${row.voltage.toFixed(3)} p.u. (Fase ${row.fase})` : 'N/A'}</td>
              <td>{parseFloat(row.demanda.toFixed(1)).toLocaleString('es-ES')} kW</td>
              <td>
                <span className={`${styles.badge} ${styles[row.styleClass]}`}>
                  {row.estado}
                </span>
              </td>
              <td className={styles.actionCell}>
                <button 
                  className={styles.detailsBtn} 
                  onClick={() => navigate(`/zonas/${row.id}`)}
                >
                  Detalles
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ZonesTable;