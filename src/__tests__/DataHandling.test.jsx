import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGridData } from '../hooks/hook';
import { ApiContext } from '../context/ApiContext';
import React from 'react';

// Sample JSON structure as found in system.json and buses.json
const mockBusesData = {
  "1": {
    "zona": "Central",
    "datosHorarios": [
      { "hora": 0, "v1": 1.0, "v2": 1.0, "v3": 1.0 },
      { "hora": 1, "v1": 0.98, "v2": 0.98, "v3": 0.98 }
    ]
  },
  "2": {
    "zona": "Norte",
    "datosHorarios": [
      { "hora": 0, "v1": 0.92, "v2": 0.92, "v3": 0.92 }
    ]
  }
};

describe('useGridData - JSON Data Handling', () => {
  const wrapper = ({ children }) => (
    <ApiContext.Provider value={{
      systemData: [],
      busesData: mockBusesData,
      selectedHour: 0,
      isLoading: false,
      error: null
    }}>
      {children}
    </ApiContext.Provider>
  );

  it('should correctly retrieve bus info by ID', () => {
    const { result } = renderHook(() => useGridData(), { wrapper });
    
    const busInfo = result.current.getBusInfo("1");
    expect(busInfo.zona).toBe("Central");
    expect(busInfo.datosHorarios).toHaveLength(2);
  });

  it('should correctly retrieve bus hourly data for the selected hour', () => {
    const { result } = renderHook(() => useGridData(), { wrapper });
    
    const hourData = result.current.getBusHourData("1");
    expect(hourData.hora).toBe(0);
    expect(hourData.v1).toBe(1.0);
  });

  it('should return empty object for non-existent bus ID', () => {
    const { result } = renderHook(() => useGridData(), { wrapper });
    
    const hourData = result.current.getBusHourData("999");
    expect(hourData).toEqual({});
  });
});
