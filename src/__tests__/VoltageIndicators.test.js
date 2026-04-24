import { describe, it, expect } from 'vitest';
import { getVoltageStatus } from '../utils/gridUtils';

describe('getVoltageStatus', () => {
  it('should return "danger" for voltages <= 0.94', () => {
    expect(getVoltageStatus(0.93)).toBe('danger');
    expect(getVoltageStatus(0.94)).toBe('danger');
  });

  it('should return "danger" for voltages >= 1.06', () => {
    expect(getVoltageStatus(1.06)).toBe('danger');
    expect(getVoltageStatus(1.1)).toBe('danger');
  });

  it('should return "warning" for voltages between 0.94 and 0.96', () => {
    expect(getVoltageStatus(0.95)).toBe('warning');
    expect(getVoltageStatus(0.96)).toBe('warning');
  });

  it('should return "warning" for voltages between 1.04 and 1.06', () => {
    expect(getVoltageStatus(1.04)).toBe('warning');
    expect(getVoltageStatus(1.05)).toBe('warning');
  });

  it('should return "nominal" for voltages around 1.0', () => {
    expect(getVoltageStatus(0.99)).toBe('nominal');
    expect(getVoltageStatus(1.0)).toBe('nominal');
    expect(getVoltageStatus(1.01)).toBe('nominal');
  });

  it('should return null for null or undefined input', () => {
    expect(getVoltageStatus(null)).toBe(null);
    expect(getVoltageStatus(undefined)).toBe(null);
  });
});
