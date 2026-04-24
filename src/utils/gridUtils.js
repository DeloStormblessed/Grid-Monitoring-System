/**
 * Determina el estado de un voltaje (danger, warning, nominal)
 */
export const getVoltageStatus = (voltage) => {
  if (voltage === null || voltage === undefined) return null;
  if (voltage <= 0.94 || voltage >= 1.06) return 'danger';
  if (voltage <= 0.96 || voltage >= 1.04) return 'warning';
  return 'nominal';
};

/**
 * Calcula el voltaje promedio de un conjunto de voltajes
 */
export const calculateAverageVoltage = (v1, v2, v3) => {
  const validVoltages = [v1, v2, v3].filter(v => v !== null && v !== undefined);
  return validVoltages.length > 0
    ? validVoltages.reduce((sum, v) => sum + v, 0) / validVoltages.length
    : null;
};
