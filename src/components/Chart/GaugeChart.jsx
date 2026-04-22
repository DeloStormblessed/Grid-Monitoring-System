import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from './GaugeChart.module.css';

const GaugeChart = ({ value, title, noBorder = false }) => {
  const MIN_VAL = 0.92;
  const MAX_VAL = 1.08;
  const RANGE = MAX_VAL - MIN_VAL;

  // Determinar estado basado en rango de voltaje
  const getVoltageStatus = (val) => {
    if (val < 0.94 || val > 1.06) return 'danger';
    if (val < 0.96 || val > 1.04) return 'warning';
    return 'nominal';
  };

  const voltageStatus = useMemo(() => {
    return value !== null && value !== undefined ? getVoltageStatus(value) : 'nominal';
  }, [value]);

  const gaugeData = useMemo(() => [
    { value: 0.02, color: 'var(--ind-danger)' },
    { value: 0.02, color: 'var(--ind-warning)' },
    { value: 0.08, color: 'var(--ind-success)' },
    { value: 0.02, color: 'var(--ind-warning)' },
    { value: 0.02, color: 'var(--ind-danger)' },
  ], []);

  let safeValue = value !== null && value !== undefined ? value : 1.0;
  safeValue = Math.max(MIN_VAL, Math.min(MAX_VAL, safeValue));

  // Limitar la aguja a 1.07 para que no se salga del gráfico
  const needleValue = Math.min(1.07, safeValue);
  const percentage = (needleValue - MIN_VAL) / RANGE;
  const angle = -90 + (percentage * 180);

  const statusClass = styles[`status${voltageStatus.charAt(0).toUpperCase()}${voltageStatus.slice(1)}`];
  const noBorderClass = noBorder ? styles.noBorder : '';

  return (
    <div className={`${styles.gaugeCard} ${statusClass || ''} ${noBorderClass}`}>
      <p className={styles.title}>{title}</p>
      
      <div className={styles.gaugeContent}>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={gaugeData}
                dataKey="value"
                startAngle={180}
                endAngle={0}
                cx="50%"
                cy="100%"
                innerRadius="60%"
                outerRadius="100%"
                stroke="none"
                isAnimationActive={false}
              >
                {gaugeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className={styles.gaugeOverlay}>
            <div
              className={styles.needle}
              style={{ transform: `rotate(${angle}deg)` }}
            />
            <div className={styles.centerDot} />
          </div>
        </div>
      </div>

      <div className={styles.valueContainer}>
        <span className={styles.value}>
          {value !== null && value !== undefined ? value.toFixed(2) : '--'}
        </span>
        <span className={styles.unit}>p.u.</span>
      </div>
    </div>
  );
};

export default GaugeChart;
