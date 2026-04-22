import React, { useRef, useCallback } from 'react';
import {
  XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, AreaChart, Area, ReferenceLine, Label, Legend
} from 'recharts';
import styles from './TrendChart.module.css';

const TrendChart = ({
  data,
  dataKey,
  dataKeys,
  title,
  color = "#000",
  colors = [],
  selectedHour = 0,
  onSliderChange,
  yAxisLabel = "Demanda (kW)",
  yAxisDomain = ['auto', 'auto'],
  yAxisTicks, // NUEVA PROPIEDAD: Para definir etiquetas exactas en el eje Y
  yAxisDecimals = 0, // Número de decimales en el eje Y
  horizontalGuides = [],
  showLegend = true
}) => {

  const initialKeys = dataKeys || [dataKey];
  const initialColors = colors.length > 0 ? colors : [color];
  const isDragging = useRef(false);

  const activeKeysInfo = initialKeys.reduce((acc, key, index) => {
    const hasData = data.some(item => item[key] !== null && item[key] !== undefined);
    if (hasData) {
      acc.push({ key: key, color: initialColors[index] || "#000" });
    }
    return acc;
  }, []);

  const updateHour = useCallback((state) => {
    if (state && state.activeLabel !== undefined) {
      const hour = Number(state.activeLabel);
      if (hour !== selectedHour) {
        onSliderChange?.(hour);
      }
    }
  }, [selectedHour, onSliderChange]);

  const handleClick = (state) => {
    updateHour(state);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseMove = (state) => {
    if (isDragging.current) {
      updateHour(state);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className={styles.chartWrapper} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div style={{ width: '100%', height: '100%', minHeight: 180, cursor: 'crosshair', transition: 'all 0.15s ease-out' }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data} margin={{ top: 40, right: 30, left: 20, bottom: 40 }} onClick={handleClick} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
            <defs>
              {activeKeysInfo.map((info) => (
                <linearGradient key={`grad-${info.key}`} id={`colorGradient-${info.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={info.color} stopOpacity={activeKeysInfo.length > 1 ? 0 : 0.1} />
                  <stop offset="95%" stopColor={info.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />

            <XAxis
              dataKey="hora"
              stroke="#000"
              type="number"
              domain={[0, 23]}
              ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]}
            >
              <Label value="Tiempo (h)" position="bottom" />
            </XAxis>

            <YAxis
              stroke="#000"
              domain={yAxisDomain}
              ticks={yAxisTicks} // Aplicamos los ticks personalizados
              // Formateamos para que use comas como pediste (ej: 0,94)
              tickFormatter={(val) => val.toLocaleString('es-ES', { minimumFractionDigits: yAxisDecimals, maximumFractionDigits: yAxisDecimals })}
            >
              <Label value={yAxisLabel} angle={-90} position="left" />
            </YAxis>

            {showLegend && activeKeysInfo.length > 0 && <Legend verticalAlign="top" height={36} />}

            {horizontalGuides.map((guide, i) => (
              <ReferenceLine key={`guide-${i}`} y={guide.value} stroke={guide.color} strokeDasharray="4 4" />
            ))}

            <ReferenceLine x={selectedHour} stroke="#666" strokeWidth={2} strokeDasharray="5 5" />

            {activeKeysInfo.map((info) => (
              <Area
                key={info.key}
                type="monotone"
                dataKey={info.key}
                name={initialKeys.length > 1 ? `Fase ${info.key.replace('v', '')}` : title}
                stroke={info.color}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#colorGradient-${info.key})`}
                activeDot={false}
                dot={(props) => {
                  const { cx, payload } = props;
                  const value = payload[info.key];
                  if (payload?.hora === selectedHour && value !== null && value !== undefined) {
                    return (
                      <circle key={`dot-${info.key}`} cx={cx} cy={props.cy} r={6} fill={info.color} stroke="#fff" strokeWidth={2} />
                    );
                  }
                  return null;
                }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;