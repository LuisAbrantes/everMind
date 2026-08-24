import { IStorageGateway } from './IStorageGateway';

/**
 * Storage Gateway leveraging MMKV when available in native environment,
 * with graceful in-memory fallback for non-native test/web environments.
 */
export class MMKVStorageGateway implements IStorageGateway {
  private fallbackStorage = new Map<string, string>();
  private isNativeMMKV = false;
  private mmkvInstance: {
    getString: (key: string) => string | undefined;
    set: (key: string, value: string) => void;
    delete: (key: string) => void;
    clearAll: () => void;
  } | null = null;

  constructor() {
    try {
      // Dynamic require to prevent crashes in node/jest test environments without native modules
      const { MMKV } = require('react-native-mmkv');
      this.mmkvInstance = new MMKV();
      this.isNativeMMKV = true;
    } catch {
      this.isNativeMMKV = false;
    }
  }

  public get<T>(key: string): T | null {
    if (this.isNativeMMKV && this.mmkvInstance) {
      const raw = this.mmkvInstance.getString(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    }

    const memoryRaw = this.fallbackStorage.get(key);
    if (!memoryRaw) return null;
    try {
      return JSON.parse(memoryRaw) as T;
    } catch {
      return null;
    }
  }

  public set<T>(key: string, value: T): void {
    const serialized = JSON.stringify(value);
    if (this.isNativeMMKV && this.mmkvInstance) {
      this.mmkvInstance.set(key, serialized);
    } else {
      this.fallbackStorage.set(key, serialized);
    }
  }

  public remove(key: string): void {
    if (this.isNativeMMKV && this.mmkvInstance) {
      this.mmkvInstance.delete(key);
    } else {
      this.fallbackStorage.delete(key);
    }
  }

  public clear(): void {
    if (this.isNativeMMKV && this.mmkvInstance) {
      this.mmkvInstance.clearAll();
    } else {
      this.fallbackStorage.clear();
    }
  }
}
