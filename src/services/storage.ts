/**
 * Simple resilient storage wrapper
 * Easily swappable for Android Room / DataStore via NativeBridge or Capacitor preferences
 */

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`stillwater_${key}`);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`[storage] Failed reading ${key}:`, e);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`stillwater_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn(`[storage] Failed writing ${key}:`, e);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(`stillwater_${key}`);
    } catch (e) {
      console.warn(`[storage] Failed removing ${key}:`, e);
    }
  },

  clearAll(): void {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('stillwater_'));
      keys.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('[storage] Failed clearing storage:', e);
    }
  }
};
