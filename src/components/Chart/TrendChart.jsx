import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, AreaChart, Area, ReferenceLine, Label 
} from 'recharts';
import styles from './TrendChart.module.css'; 

const BaseChart = ({ data, dataKey, title, color = "#000", selectedHour = 0, onSliderChange }) => {
  const [hoverHour, setHoverHour] = useState(selectedHour);
  const [isMouseOverChart, setIsMouseOverChart] = useState(false);
  const chartRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastRoundedHourRef = useRef(selectedHour);
  const isTouchingRef = useRef(false);

  const updateSelectedHour = useCallback((hour) => {
    onSliderChange?.(hour);
  }, [onSliderChange]);

  // Función auxiliar para calcular la posición desde coordenada X (retorna decimal para suavidad)
  const calculateHourFromX = useCallback((xPosition) => {
    const chartContainer = chartRef.current?.querySelector('.recharts-wrapper');
    if (!chartContainer) return lastRoundedHourRef.current;

    const rect = chartContainer.getBoundingClientRect();
    const relativeX = xPosition - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
    // Retornar decimal para movimiento suave
    return percentage * (data.length - 1);
  }, [data.length]);

  const updateHourWithTimeout = useCallback((newHourDecimal) => {
    const newHourRounded = Math.round(newHourDecimal);
    
    // Actualizar visualización con valor decimal (suave)
    setHoverHour(newHourDecimal);
    
    // Solo actualizar KPIs si la hora redondeada cambió
    if (newHourRounded !== lastRoundedHourRef.current) {
      lastRoundedHourRef.current = newHourRounded;
      
      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Establecer nuevo timeout de 300ms
      timeoutRef.current = setTimeout(() => {
        updateSelectedHour(newHourRounded);
      }, 300);
    }
  }, [updateSelectedHour]);

  const handleMouseMove = useCallback((e) => {
    if (!chartRef.current || !isMouseOverChart || isTouchingRef.current) return;
    const newHour = calculateHourFromX(e.clientX);
    updateHourWithTimeout(newHour);
  }, [isMouseOverChart, calculateHourFromX, updateHourWithTimeout]);

  const handleTouchStart = useCallback((e) => {
    isTouchingRef.current = true;
    if (e.touches.length > 0) {
      const newHour = calculateHourFromX(e.touches[0].clientX);
      updateHourWithTimeout(newHour);
    }
  }, [calculateHourFromX, updateHourWithTimeout]);

  const handleTouchMove = useCallback((e) => {
    if (!isTouchingRef.current || !chartRef.current) return;
    
    if (e.touches.length > 0) {
      const newHour = calculateHourFromX(e.touches[0].clientX);
      updateHourWithTimeout(newHour);
    }
  }, [calculateHourFromX, updateHourWithTimeout]);

  const handleTouchEnd = useCallback(() => {
    isTouchingRef.current = false;
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsMouseOverChart(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsMouseOverChart(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Resetear a selectedHour cuando salgas del chart
    setHoverHour(selectedHour);
    lastRoundedHourRef.current = selectedHour;
  }, [selectedHour]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Sincronizar hoverHour cuando selectedHour cambia desde afuera
  useEffect(() => {
    if (!isMouseOverChart && !isTouchingRef.current) {
      setHoverHour(selectedHour);
      lastRoundedHourRef.current = selectedHour;
    }
  }, [selectedHour, isMouseOverChart]);

  // Determinar qué hora mostrar en el slider
  const displayHour = isMouseOverChart || isTouchingRef.current ? hoverHour : selectedHour;

  return (
    <div 
      className={styles.chartWrapper}
      ref={chartRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      <div 
        style={{ width: '100%', height: 500, cursor: 'crosshair', transition: 'all 0.15s ease-out' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            margin={{ top: 40, right: 30, left: 20, bottom: 40 }}
          >
            <defs>
              <linearGradient id={`colorGradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            
            {/* Asumimos que el eje X siempre es la 'hora' para este MVP */}
            <XAxis 
              dataKey="hora" 
              tickFormatter={(value) => `${value}`} 
              stroke="#000"
              type="number"
              domain={[0, 23]}
              ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]}
            >
              <Label value="Tiempo (h)" position="bottom" />
            </XAxis>
            <YAxis stroke="#000">
              <Label value="Demanda (kW)" angle={-90} position="left" />
            </YAxis>
            {/* Línea vertical que sigue al ratón y se confirma al esperar 300ms */}
            <ReferenceLine 
              x={Math.round(displayHour)}
              stroke={color}
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ value: `${Math.round(displayHour)}:00`, position: 'top', fill: color, fontSize: 12 }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#colorGradient-${dataKey})`}
              activeDot={false}
              dot={(props) => {
                const { cx, payload } = props;
                if (payload?.hora === Math.round(displayHour)) {
                  return (
                    <circle 
                      cx={cx} 
                      cy={props.cy} 
                      r={6} 
                      fill={color} 
                      stroke="#fff" 
                      strokeWidth={2}
                    />
                  );
                }
                return null;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BaseChart;