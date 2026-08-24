import { IStorageGateway } from './IStorageGateway';

/**
 * In-memory storage gateway implementation for fast unit tests and mock environments.
 */
export class InMemoryStorageGateway implements IStorageGateway {
  private storage = new Map<string, string>();

  public get<T>(key: string): T | null {
    const raw = this.storage.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  public set<T>(key: string, value: T): void {
    this.storage.set(key, JSON.stringify(value));
  }

  public remove(key: string): void {
    this.storage.delete(key);
  }

  public clear(): void {
    this.storage.clear();
  }
}
