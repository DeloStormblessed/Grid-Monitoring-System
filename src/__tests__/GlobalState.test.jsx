import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGridData } from '../hooks/hook';
import { ApiContext } from '../context/ApiContext';
import React from 'react';

// Mock system data
const mockSystemData = [
  { hora: 0, p_mw: 10 },
  { hora: 1, p_mw: 20 },
  { hora: 10, p_mw: 50 }
];

const mockBusesData = {
  "Bus1": {
    zona: "Zona A",
    datosHorarios: [
      { hora: 0, v1: 1.0 },
      { hora: 1, v1: 0.95 }
    ]
  }
};

describe('useGridData - Global State (selectedHour)', () => {
  it('should return system data corresponding to the selectedHour', () => {
    const wrapper = ({ children }) => (
      <ApiContext.Provider value={{
        systemData: mockSystemData,
        busesData: mockBusesData,
        selectedHour: 1,
        isLoading: false,
        error: null
      }}>
        {children}
      </ApiContext.Provider>
    );

    const { result } = renderHook(() => useGridData(), { wrapper });

    // Should return data for hour 1
    expect(result.current.currentSystemData.hora).toBe(1);
    expect(result.current.currentSystemData.p_mw).toBe(20);
  });

  it('should return first item if selectedHour is not found', () => {
    const wrapper = ({ children }) => (
      <ApiContext.Provider value={{
        systemData: mockSystemData,
        busesData: mockBusesData,
        selectedHour: 5, // Hour 5 doesn't exist in mock
        isLoading: false,
        error: null
      }}>
        {children}
      </ApiContext.Provider>
    );

    const { result } = renderHook(() => useGridData(), { wrapper });

    // Should default to first item (hour 0)
    expect(result.current.currentSystemData.hora).toBe(0);
  });
});
