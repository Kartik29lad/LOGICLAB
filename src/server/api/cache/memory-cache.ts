interface Entry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache {
  private readonly entries = new Map<string, Entry<unknown>>();

  public get<T>(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  public set<T>(key: string, value: T, ttlMs: number): void {
    if (ttlMs <= 0) return;
    this.entries.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  public delete(key: string): void {
    this.entries.delete(key);
  }
  public clearPrefix(prefix: string): void {
    for (const key of this.entries.keys()) if (key.startsWith(prefix)) this.entries.delete(key);
  }
}

export const apiCache = new MemoryCache();
