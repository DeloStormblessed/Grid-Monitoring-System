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
  yAxisTicks,
  yAxisDecimals = 0,
  horizontalGuides = [],
  showLegend = true
}) => {

  const initialKeys = dataKeys || [dataKey];
  const initialColors = colors.length > 0 ? colors : [color];
  
  const chartRef = useRef(null);
  const isDragging = useRef(false);
  const STABLE_MARGINS = { top: 20, right: 20, left: 45, bottom: 20 };

  const activeKeysInfo = initialKeys.reduce((acc, key, index) => {
    const hasData = data.some(item => item[key] !== null && item[key] !== undefined);
    if (hasData) {
      acc.push({ key: key, color: initialColors[index] || "#000" });
    }
    return acc;
  }, []);

  // --- LÓGICA MATEMÁTICA PURA (Independiente de Recharts) ---
  const handlePointerEvent = useCallback((e) => {
    if (!chartRef.current) return;

    // Obtenemos las dimensiones reales del contenedor en la pantalla
    const rect = chartRef.current.getBoundingClientRect();
    
    // Ancho útil restando los márgenes
    const chartWidth = rect.width - STABLE_MARGINS.left - STABLE_MARGINS.right;
    
    // Posición del toque (e.clientX funciona para ratón y táctil en PointerEvents)
    const xPosition = e.clientX - rect.left - STABLE_MARGINS.left;

    // Calculamos porcentaje y lo limitamos entre 0 y 1
    let percentage = xPosition / chartWidth;
    percentage = Math.max(0, Math.min(1, percentage));

    const hour = Math.round(percentage * 23);

    if (hour !== selectedHour) {
      onSliderChange?.(hour);
    }
  }, [selectedHour, onSliderChange]);

  // --- MANEJO DE EVENTOS UNIVERSALES (Pointer Events) ---
  const handlePointerDown = (e) => {
    isDragging.current = true;
    // Capturamos el puntero para que no se pierda si el dedo sale un poco del gráfico al arrastrar
    e.target.setPointerCapture(e.pointerId); 
    handlePointerEvent(e);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    handlePointerEvent(e);
  };

  const handlePointerUp = (e) => {
    isDragging.current = false;
    e.target.releasePointerCapture(e.pointerId);
  };

  return (
    <div className={styles.chartWrapper}>
      <div 
        className={styles.chartInnerContainer}
        ref={chartRef}
        /* Asignamos los eventos universales aquí */
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        /* Bloqueamos el scroll nativo del móvil en esta zona para poder deslizar fluidamente */
        style={{ touchAction: 'none' }} 
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart 
            data={data} 
            margin={STABLE_MARGINS}
            /* MAGIA: Desactivamos todos los eventos internos de Recharts */
            style={{ pointerEvents: 'none' }} 
          >
            <defs>
              {activeKeysInfo.map((info) => (
                <linearGradient key={`grad-${info.key}`} id={`colorGradient-${info.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={info.color} stopOpacity={activeKeysInfo.length > 1 ? 0 : 0.1} />
                  <stop offset="95%" stopColor={info.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d0d4da" />

            <XAxis
              dataKey="hora"
              stroke="#6b7280"
              type="number"
              domain={[0, 23]}
              ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]}
            >
              <Label value="Tiempo (h)" position="bottom" offset={5} dx={-75} />
            </XAxis>

            <YAxis
              stroke="#6b7280"
              domain={yAxisDomain}
              ticks={yAxisTicks}
              tickFormatter={(val) => val.toLocaleString('es-ES', { minimumFractionDigits: yAxisDecimals, maximumFractionDigits: yAxisDecimals })}
            >
              <Label value={yAxisLabel} angle={-90} position="left" offset={0} dy={0} />
            </YAxis>

            {showLegend && activeKeysInfo.length > 0 && (
              <Legend 
                verticalAlign="top" 
                align="center" 
                height={36}
              />
            )}

            {horizontalGuides.map((guide, i) => (
              <ReferenceLine key={`guide-${i}`} y={guide.value} stroke={guide.color} strokeDasharray="4 4" />
            ))}

            <ReferenceLine x={selectedHour} stroke="#009999" strokeWidth={2} strokeDasharray="5 5" />

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