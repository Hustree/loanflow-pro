import { describe, expect, it } from 'vitest';

import passkeyReducer, {
  addDevice,
  clearError,
  removeDevice,
  resetBiometricEnrollment,
  resetSteps,
  setAndroidCapabilities,
  setAuthenticationStep,
  setAvailableBiometrics,
  setBiometricEnrollmentState,
  setEnrolledBiometrics,
  setRegistrationStep,
  setSecurityLevel,
  setSupported,
} from './passkeySlice';
import type { PasskeyDevice } from './passkeySlice';

const sampleDevice: PasskeyDevice = {
  id: 'dev-1',
  name: 'iPhone 15',
  type: 'mobile',
  browser: 'Safari',
  os: 'iOS',
  lastUsed: '2026-04-01T00:00:00.000Z',
  createdAt: '2026-04-01T00:00:00.000Z',
};

describe('passkeySlice (sync reducers)', () => {
  it('returns the initial state', () => {
    const state = passkeyReducer(undefined, { type: '@@INIT' });
    expect(state.isSupported).toBe(false);
    expect(state.devices).toEqual([]);
    expect(state.registrationStep).toBe('idle');
    expect(state.authenticationStep).toBe('idle');
    expect(state.biometricEnrollment).toEqual({ isEnrolling: false });
  });

  it('setSupported toggles support flag', () => {
    expect(passkeyReducer(undefined, setSupported(true)).isSupported).toBe(true);
  });

  it('clearError nulls the error', () => {
    const initial = passkeyReducer(undefined, { type: '@@INIT' });
    const errored = { ...initial, error: 'boom' };
    expect(passkeyReducer(errored, clearError()).error).toBeNull();
  });

  it('addDevice / removeDevice manage the device list', () => {
    let state = passkeyReducer(undefined, addDevice(sampleDevice));
    expect(state.devices).toHaveLength(1);
    state = passkeyReducer(state, removeDevice('dev-1'));
    expect(state.devices).toHaveLength(0);
  });

  it('setRegistrationStep / setAuthenticationStep / resetSteps drive ceremony state', () => {
    let state = passkeyReducer(undefined, setRegistrationStep('prompting'));
    expect(state.registrationStep).toBe('prompting');
    state = passkeyReducer(state, setAuthenticationStep('verifying'));
    expect(state.authenticationStep).toBe('verifying');
    state = passkeyReducer(state, resetSteps());
    expect(state.registrationStep).toBe('idle');
    expect(state.authenticationStep).toBe('idle');
  });

  it('setBiometricEnrollmentState merges partial updates', () => {
    let state = passkeyReducer(
      undefined,
      setBiometricEnrollmentState({ isEnrolling: true, enrollmentType: 'fingerprint' }),
    );
    expect(state.biometricEnrollment.isEnrolling).toBe(true);
    expect(state.biometricEnrollment.enrollmentType).toBe('fingerprint');
    state = passkeyReducer(state, setBiometricEnrollmentState({ success: true }));
    expect(state.biometricEnrollment.success).toBe(true);
    expect(state.biometricEnrollment.enrollmentType).toBe('fingerprint');
  });

  it('resetBiometricEnrollment clears enrollment state', () => {
    let state = passkeyReducer(
      undefined,
      setBiometricEnrollmentState({ isEnrolling: true, enrollmentType: 'face' }),
    );
    state = passkeyReducer(state, resetBiometricEnrollment());
    expect(state.biometricEnrollment).toEqual({ isEnrolling: false });
  });

  it('setAndroidCapabilities / setSecurityLevel / setAvailableBiometrics / setEnrolledBiometrics', () => {
    let state = passkeyReducer(undefined, setAndroidCapabilities(null));
    expect(state.androidCapabilities).toBeNull();
    state = passkeyReducer(state, setSecurityLevel('HIGH'));
    expect(state.securityLevel).toBe('HIGH');
    state = passkeyReducer(state, setAvailableBiometrics(['fingerprint']));
    expect(state.availableBiometrics).toEqual(['fingerprint']);
    state = passkeyReducer(state, setEnrolledBiometrics(['face']));
    expect(state.enrolledBiometrics).toEqual(['face']);
  });
});
