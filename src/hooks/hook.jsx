import { useContext, useMemo } from 'react';
import { ApiContext } from '../context/ApiContext';

/**
 * Hook personalizado para manejar la lógica reutilizable de datos de la red
 * Encapsula la obtención de contexto y cálculos comunes
 */
export const useGridData = () => {
  const context = useContext(ApiContext);
  
  if (!context) {
    throw new Error('useGridData debe ser usado dentro de un ApiProvider');
  }

  const {
    systemData,
    busesData,
    isLoading,
    error,
    selectedHour,
    setSelectedHour,
    weather
  } = context;

  /**
   * Obtiene los datos del sistema para la hora seleccionada
   */
  const currentSystemData = useMemo(() => {
    if (!systemData || systemData.length === 0) return null;
    return systemData.find(item => item.hora === selectedHour) || systemData[0];
  }, [systemData, selectedHour]);

  /**
   * Obtiene los datos de un bus específico
   */
  const getBusInfo = (busId) => {
    return busesData ? busesData[busId] : null;
  };

  /**
   * Obtiene los datos de la hora seleccionada para un bus específico
   */
  const getBusHourData = (busId) => {
    const busInfo = getBusInfo(busId);
    if (!busInfo) return {};
    return busInfo.datosHorarios.find(d => d.hora === selectedHour) || busInfo.datosHorarios[0] || {};
  };

  /**
   * Calcula el voltaje promedio de un conjunto de voltajes
   */
  const calculateAverageVoltage = (v1, v2, v3) => {
    const validVoltages = [v1, v2, v3].filter(v => v !== null && v !== undefined);
    return validVoltages.length > 0
      ? validVoltages.reduce((sum, v) => sum + v, 0) / validVoltages.length
      : null;
  };

  /**
   * Determina el estado de un voltaje (danger, warning, nominal)
   */
  const getVoltageStatus = (voltage) => {
    if (voltage === null || voltage === undefined) return null;
    if (voltage <= 0.94 || voltage >= 1.06) return 'danger';
    if (voltage <= 0.96 || voltage >= 1.04) return 'warning';
    return 'nominal';
  };

  /**
   * Obtiene las zonas en riesgo (con estados de alerta)
   */
  const getAtRiskZones = (statusClassMap) => {
    if (!busesData) return [];
    
    return Object.entries(busesData)
      .map(([id, info]) => {
        const hourData = info.datosHorarios.find(d => d.hora === selectedHour) || {};
        const voltages = [hourData.v1, hourData.v2, hourData.v3].filter(v => v != null);
        
        let colorClass = null;
        let priority = 3;
        let status = 'nominal';

        voltages.forEach(v => {
          const voltageStatus = getVoltageStatus(v);
          if (voltageStatus === 'danger') {
            colorClass = statusClassMap?.statusDanger;
            priority = 1;
            status = 'danger';
          } else if (voltageStatus === 'warning' && priority > 1) {
            colorClass = statusClassMap?.statusWarning;
            priority = 2;
            status = 'warning';
          }
        });

        return { id, nombre: info.zona, colorClass, priority, status };
      })
      .filter(z => z.priority < 3)
      .sort((a, b) => a.priority - b.priority);
  };

  /**
   * Calcula la fila y columna de voltajes para un bus
   */
  const getVoltageReadings = (busId) => {
    const hourData = getBusHourData(busId);
    return {
      v1: hourData.v1 || null,
      v2: hourData.v2 || null,
      v3: hourData.v3 || null
    };
  };

  /**
   * Formatea el valor del clima
   */
  const formatWeather = () => {
    const weatherParts = weather.split(' | ');
    return weatherParts.length === 2
      ? {
          isMultiline: true,
          parts: weatherParts
        }
      : {
          isMultiline: false,
          value: weather
        };
  };

  return {
    // Datos
    systemData,
    busesData,
    currentSystemData,
    
    // Estados
    isLoading,
    error,
    selectedHour,
    weather,
    
    // Setters
    setSelectedHour,
    
    // Métodos
    getBusInfo,
    getBusHourData,
    calculateAverageVoltage,
    getVoltageStatus,
    getAtRiskZones,
    getVoltageReadings,
    formatWeather
  };
};
