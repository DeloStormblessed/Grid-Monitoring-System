import React, { useMemo, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowDown } from 'react-icons/io';
import { ApiContext } from '../../context/ApiContext';
import styles from './ZonesTable.module.css';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
// ZONA_OPTIONS must exactly match the values stored in busInfo.zona
const ZONA_OPTIONS   = ['Desocupada', 'Residencial', 'Industrial', 'Comercial'];
const ESTADO_OPTIONS = ['Nominal', 'Aviso', 'Peligro'];

const TENSION_MIN = 0.90;
const TENSION_MAX = 1.10;
const DEMANDA_MIN = -1500;
const DEMANDA_MAX =  1500;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getVoltageState = (voltage) => {
  if (voltage === null || voltage === undefined)
    return { state: 'Desconocido', styleClass: 'gray', priority: 4 };
  if (voltage <= 0.94 || voltage >= 1.06)
    return { state: 'Peligro', styleClass: 'peligro', priority: 1 };
  if (voltage <= 0.96 || voltage >= 1.04)
    return { state: 'Aviso',   styleClass: 'aviso',   priority: 2 };
  return   { state: 'Nominal', styleClass: 'nominal', priority: 3 };
};

// ─── DUAL RANGE SLIDER ───────────────────────────────────────────────────────
const DualRangeSlider = ({ min, max, step = 0.001, value, onChange, format }) => {
  const [low, high] = value;
  const trackRef = useRef(null);

  const pct = useCallback((v) => ((v - min) / (max - min)) * 100, [min, max]);

  useEffect(() => {
    if (!trackRef.current) return;
    trackRef.current.style.left  = `${pct(low)}%`;
    trackRef.current.style.width = `${pct(high) - pct(low)}%`;
  }, [low, high, pct]);

  const handleLow  = (e) => {
    const v = parseFloat(e.target.value);
    onChange([Math.min(v, high - step), high]);
  };
  const handleHigh = (e) => {
    const v = parseFloat(e.target.value);
    onChange([low, Math.max(v, low + step)]);
  };

  return (
    <div className={styles.sliderWrapper}>
      <div className={styles.sliderLabels}>
        <span>{format(low)}</span>
        <span>{format(high)}</span>
      </div>
      <div className={styles.sliderTrackOuter}>
        <div className={styles.sliderTrackBg} />
        <div className={styles.sliderTrackFill} ref={trackRef} />
        <input type="range" className={`${styles.rangeInput} ${styles.sliderLow}`}
          min={min} max={max} step={step} value={low}  onChange={handleLow} />
        <input type="range" className={`${styles.rangeInput} ${styles.sliderHigh}`}
          min={min} max={max} step={step} value={high} onChange={handleHigh} />
      </div>
    </div>
  );
};

// ─── CHIP GROUP ──────────────────────────────────────────────────────────────
// Opt-out model: all selected by default, clicking deselects.
const ChipGroup = ({ options, selected, onChange, styleMap }) => {
  const toggle = (opt) => {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onChange(next);
  };
  return (
    <div className={styles.chipGroup}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={[
            styles.chip,
            styleMap?.[opt] ? styles[styleMap[opt]] : '',
            selected.includes(opt) ? styles.chipActive : '',
          ].join(' ')}
          onClick={() => toggle(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const ZonesTable = ({ selectedHour, showFilter = false }) => {
  const navigate      = useNavigate();
  const { busesData } = useContext(ApiContext);

  const [isExpanded,     setIsExpanded]     = useState(false);
  // Opt-in: empezamos con arreglos vacíos (sin filtros activos)
  const [selectedZonas,  setSelectedZonas]  = useState([]);
  const [selectedEstado, setSelectedEstado] = useState([]);
  const [tensionRange,   setTensionRange]   = useState([TENSION_MIN, TENSION_MAX]);
  const [demandaRange,   setDemandaRange]   = useState([DEMANDA_MIN, DEMANDA_MAX]);

  const resetFilters = () => {
    setSelectedZonas([]); // Volvemos al estado inicial vacío
    setSelectedEstado([]);
    setTensionRange([TENSION_MIN, TENSION_MAX]);
    setDemandaRange([DEMANDA_MIN, DEMANDA_MAX]);
  };

  // 1. Process data — picks worst-state phase per bus
  const tableData = useMemo(() => {
    if (!busesData) return [];
    const data = [];

    Object.entries(busesData).forEach(([busId, busInfo]) => {
      const hourData = busInfo.datosHorarios.find((d) => d.hora === selectedHour) || {};
      const phases = [
        { name: '1', value: hourData.v1 },
        { name: '2', value: hourData.v2 },
        { name: '3', value: hourData.v3 },
      ];

      let worstState   = { state: 'Nominal', styleClass: 'nominal', priority: 3 };
      let worstVoltage = null;
      let worstPhase   = '';

      phases.forEach((phase) => {
        if (phase.value !== null && phase.value !== undefined) {
          const stateInfo = getVoltageState(phase.value);
          if (stateInfo.priority < worstState.priority) {
            worstState   = stateInfo;
            worstVoltage = phase.value;
            worstPhase   = phase.name;
          }
        }
      });

      // If still Nominal, just grab the first available phase value
      if (worstVoltage === null) {
        const first = phases.find((p) => p.value !== null && p.value !== undefined);
        if (first) { worstVoltage = first.value; worstPhase = first.name; }
      }

      data.push({
        id:         busId,
        zona:       busInfo.zona,
        demanda:    hourData.cargaTotal || 0,
        voltage:    worstVoltage,
        fase:       worstPhase,
        estado:     worstState.state,
        styleClass: worstState.styleClass,
        priority:   worstState.priority,
      });
    });

    return data.sort((a, b) => a.priority - b.priority);
  }, [selectedHour, busesData]);

// 2. Filter — exact match on zona/estado (opt-in: empty means no filter)
  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      // Zona: Si hay filtros seleccionados, verificamos coincidencia
      if (selectedZonas.length > 0 && !selectedZonas.some((z) => z.toLowerCase() === row.zona.toLowerCase()))
        return false;

      // Estado: Si hay filtros seleccionados, verificamos coincidencia
      if (selectedEstado.length > 0 && !selectedEstado.some((e) => e.toLowerCase() === row.estado.toLowerCase()))
        return false;

      // Tensión range (null passes through)
      if (row.voltage !== null &&
          (row.voltage < tensionRange[0] || row.voltage > tensionRange[1]))
        return false;

      // Demanda range
      if (row.demanda < demandaRange[0] || row.demanda > demandaRange[1])
        return false;

      return true;
    });
  }, [tableData, selectedZonas, selectedEstado, tensionRange, demandaRange]);

  // isFiltering ahora comprueba si hay algo en los arreglos
  const isFiltering =
    selectedZonas.length > 0 ||
    selectedEstado.length > 0 ||
    tensionRange[0] !== TENSION_MIN || tensionRange[1] !== TENSION_MAX ||
    demandaRange[0] !== DEMANDA_MIN || demandaRange[1] !== DEMANDA_MAX;

  const estadoStyleMap = { Nominal: 'chip-nominal', Aviso: 'chip-aviso', Peligro: 'chip-peligro' };

  return (
    <div className={styles.tableContainer}>
      {showFilter && (
        <div className={styles.accordionWrapper}>
          <div className={styles.filterHeader} onClick={() => setIsExpanded(!isExpanded)}>
<div className={styles.headerLeft}>
              <span className={styles.headerTitle}>CONFIGURACIÓN DE FILTROS</span>
              {/* Usamos visibility para reservar el espacio en el DOM */}
              <span 
                className={styles.activeBadge} 
                style={{ visibility: isFiltering ? 'visible' : 'hidden' }}
              >
                FILTRANDO: {filteredData.length} / {tableData.length}
              </span>
            </div>
            <div className={styles.headerRight}>
              {/* Usamos visibility para evitar que los iconos salten */}
              <button 
                className={styles.resetBtn} 
                style={{ visibility: isFiltering ? 'visible' : 'hidden' }}
                onClick={(e) => { e.stopPropagation(); resetFilters(); }}
              >
                Restablecer
              </button>
              <IoIosArrowDown className={`${styles.toggleIcon} ${isExpanded ? styles.iconRotated : ''}`} />
            </div>
          </div>

          <div className={`${styles.filterContent} ${isExpanded ? styles.expanded : ''}`}>
            <div className={styles.filterGrid}>
              <div className={styles.filterGroup}>
                <span className={styles.groupLabel}>TIPO DE ZONA</span>
                <ChipGroup
                  options={ZONA_OPTIONS}
                  selected={selectedZonas}
                  onChange={setSelectedZonas}
                />
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.groupLabel}>ESTADO DE OPERACIÓN</span>
                <ChipGroup
                  options={ESTADO_OPTIONS}
                  selected={selectedEstado}
                  onChange={setSelectedEstado}
                  styleMap={estadoStyleMap}
                />
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.groupLabel}>RANGO DE TENSIÓN (p.u.)</span>
                <DualRangeSlider
                  min={TENSION_MIN} max={TENSION_MAX} step={0.001}
                  value={tensionRange}
                  onChange={setTensionRange}
                  format={(v) => v.toFixed(3)}
                />
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.groupLabel}>RANGO DE DEMANDA (kW)</span>
                <DualRangeSlider
                  min={DEMANDA_MIN} max={DEMANDA_MAX} step={1}
                  value={demandaRange}
                  onChange={setDemandaRange}
                  format={(v) => `${v > 0 ? '+' : ''}${Math.round(v).toLocaleString('es-ES')}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Zona</th>
              <th>Tensión</th>
              <th>Demanda</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className={styles.zonaName}>{row.zona}</span>
                    <span className={styles.busId}>(bus {row.id})</span>
                  </td>
                  <td>
                    {row.voltage !== null
                      ? `${row.voltage.toFixed(3)} p.u. (Fase ${row.fase})`
                      : 'N/A'}
                  </td>
                  <td>{parseFloat(row.demanda.toFixed(1)).toLocaleString('es-ES')} kW</td>
                  <td>
                    <span className={`${styles.badge} ${styles[row.styleClass]}`}>
                      {row.estado}
                    </span>
                  </td>
                  <td className={styles.actionCell}>
                    <button className={styles.detailsBtn} onClick={() => navigate(`/zonas/${row.id}`)}>
                      Detalles
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  Sin resultados con los filtros actuales
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ZonesTable;