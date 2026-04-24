import React, { useMemo, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiContext } from '../../context/ApiContext';
import styles from './ZonesTable.module.css';

// ─── Constantes de filtro ────────────────────────────────────────────────────
const ZONA_OPTIONS   = ['Desocupada', 'Residencial', 'Industrial', 'Comercial'];
const ESTADO_OPTIONS = ['Nominal', 'Aviso', 'Peligro'];

const TENSION_MIN  = 0.90;
const TENSION_MAX  = 1.10;
const DEMANDA_MIN  = -1500;
const DEMANDA_MAX  =  1500;

// ─── Helper: estado por voltaje ──────────────────────────────────────────────
const getVoltageState = (voltage) => {
  if (voltage === null || voltage === undefined)
    return { state: 'Desconocido', color: 'gray', priority: 4 };
  if (voltage <= 0.94 || voltage >= 1.06)
    return { state: 'Peligro', styleClass: 'peligro', priority: 1 };
  if (voltage <= 0.96 || voltage >= 1.04)
    return { state: 'Aviso',   styleClass: 'aviso',   priority: 2 };
  return   { state: 'Nominal', styleClass: 'nominal', priority: 3 };
};

// ─── Subcomponente: Dual Range Slider ────────────────────────────────────────
const DualRangeSlider = ({ min, max, step = 0.001, value, onChange, format }) => {
  const [low, high] = value;
  const trackRef = useRef(null);

  const pct = (v) => ((v - min) / (max - min)) * 100;

  const updateTrack = useCallback(() => {
    if (!trackRef.current) return;
    trackRef.current.style.left  = `${pct(low)}%`;
    trackRef.current.style.width = `${pct(high) - pct(low)}%`;
  }, [low, high, min, max]);

  useEffect(() => { updateTrack(); }, [updateTrack]);

  const handleLow = (e) => {
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
        <input
          type="range"
          className={`${styles.sliderInput} ${styles.sliderLow}`}
          min={min} max={max} step={step}
          value={low}
          onChange={handleLow}
        />
        <input
          type="range"
          className={`${styles.sliderInput} ${styles.sliderHigh}`}
          min={min} max={max} step={step}
          value={high}
          onChange={handleHigh}
        />
      </div>
    </div>
  );
};

// ─── Subcomponente: Toggle chip ───────────────────────────────────────────────
const ChipGroup = ({ options, selected, onChange }) => {
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
          className={`${styles.chip} ${selected.includes(opt) ? styles.chipActive : ''}`}
          onClick={() => toggle(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

// ─── Componente principal ────────────────────────────────────────────────────
const ZonesTable = ({ selectedHour, showFilter = false }) => {
  const navigate   = useNavigate();
  const { busesData } = useContext(ApiContext);

  // ── Estado de filtros ──
  const [searchTerm,     setSearchTerm]     = useState('');
  const [selectedZonas,  setSelectedZonas]  = useState([...ZONA_OPTIONS]);
  const [selectedEstado, setSelectedEstado] = useState([...ESTADO_OPTIONS]);
  const [tensionRange,   setTensionRange]   = useState([TENSION_MIN, TENSION_MAX]);
  const [demandaRange,   setDemandaRange]   = useState([DEMANDA_MIN, DEMANDA_MAX]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedZonas([...ZONA_OPTIONS]);
    setSelectedEstado([...ESTADO_OPTIONS]);
    setTensionRange([TENSION_MIN, TENSION_MAX]);
    setDemandaRange([DEMANDA_MIN, DEMANDA_MAX]);
  };

  // ── 1. Datos procesados ──
  const tableData = useMemo(() => {
    if (!busesData) return [];
    const data = [];

    Object.entries(busesData).forEach(([busId, busInfo]) => {
      const hourData = busInfo.datosHorarios.find((d) => d.hora === selectedHour) || {};
      const phases   = [
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

      if (worstState.priority === 3) {
        const first = phases.find((p) => p.value !== null);
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

  // ── 2. Datos filtrados ──
  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      // Texto libre
      if (
        searchTerm &&
        !row.zona.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !row.id.toString().includes(searchTerm)
      ) return false;

      // Zona (case-insensitive match contra las opciones del select)
      if (
        selectedZonas.length > 0 &&
        !selectedZonas.some((z) => z.toLowerCase() === row.zona.toLowerCase())
      ) return false;

      // Estado
      if (
        selectedEstado.length > 0 &&
        !selectedEstado.some((e) => e.toLowerCase() === row.estado.toLowerCase())
      ) return false;

      // Tensión
      if (row.voltage !== null) {
        if (row.voltage < tensionRange[0] || row.voltage > tensionRange[1]) return false;
      }

      // Demanda
      if (row.demanda < demandaRange[0] || row.demanda > demandaRange[1]) return false;

      return true;
    });
  }, [tableData, searchTerm, selectedZonas, selectedEstado, tensionRange, demandaRange]);

  const isFiltered =
    searchTerm ||
    selectedZonas.length  !== ZONA_OPTIONS.length ||
    selectedEstado.length !== ESTADO_OPTIONS.length ||
    tensionRange[0] !== TENSION_MIN || tensionRange[1] !== TENSION_MAX ||
    demandaRange[0] !== DEMANDA_MIN || demandaRange[1] !== DEMANDA_MAX;

  return (
    <div className={styles.tableContainer}>

      {/* ── Panel de filtros ── */}
      {showFilter && (
        <div className={styles.filterPanel}>

          {/* Cabecera del panel */}
          <div className={styles.filterHeader}>
            <span className={styles.filterTitle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filtros
            </span>
            <div className={styles.filterHeaderRight}>
              {isFiltered && (
                <button className={styles.resetBtn} onClick={resetFilters}>
                  Restablecer
                </button>
              )}
              <span className={styles.resultCount}>
                {filteredData.length} / {tableData.length} buses
              </span>
            </div>
          </div>

          <div className={styles.filterGrid}>


            {/* Zona */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Zona</label>
              <ChipGroup
                options={ZONA_OPTIONS}
                selected={selectedZonas}
                onChange={setSelectedZonas}
              />
            </div>

            {/* Estado */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Estado</label>
              <ChipGroup
                options={ESTADO_OPTIONS}
                selected={selectedEstado}
                onChange={setSelectedEstado}
              />
            </div>

            {/* Tensión */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Tensión (p.u.)</label>
              <DualRangeSlider
                min={TENSION_MIN}
                max={TENSION_MAX}
                step={0.001}
                value={tensionRange}
                onChange={setTensionRange}
                format={(v) => v.toFixed(3)}
              />
            </div>

            {/* Demanda */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Demanda (kW)</label>
              <DualRangeSlider
                min={DEMANDA_MIN}
                max={DEMANDA_MAX}
                step={1}
                value={demandaRange}
                onChange={setDemandaRange}
                format={(v) => `${v > 0 ? '+' : ''}${v.toLocaleString('es-ES')}`}
              />
            </div>

          </div>

        </div>
      )}

      {/* ── Tabla ── */}
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
                <td>
                  {parseFloat(row.demanda.toFixed(1)).toLocaleString('es-ES')} kW
                </td>
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
  );
};

export default ZonesTable;