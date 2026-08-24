/**
 * Generic Storage Gateway Interface (Seam)
 * ADR-0002: Offline-First Storage with MMKV and Fallbacks
 */
export interface IStorageGateway {
  get<T>(key: string): Promise<T | null> | (T | null);
  set<T>(key: string, value: T): Promise<void> | void;
  remove(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
}
