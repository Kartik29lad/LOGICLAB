interface HashNode<K, V> {
  key: K;
  value: V;
}

/**
 * Hash Table with separate chaining collision resolution.
 */
export class HashTable<K = string, V = unknown> {
  private buckets: HashNode<K, V>[][];
  private capacity: number;
  private count = 0;

  constructor(initialCapacity = 16) {
    this.capacity = initialCapacity;
    this.buckets = Array.from({ length: initialCapacity }, () => []);
  }

  private hash(key: K): number {
    const str = String(key);
    let hashVal = 0;
    for (let i = 0; i < str.length; i++) {
      hashVal = (hashVal * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hashVal % this.capacity;
  }

  public set(key: K, value: V): void {
    const idx = this.hash(key);
    const bucket = this.buckets[idx]!;

    for (const node of bucket) {
      if (node.key === key) {
        node.value = value;
        return;
      }
    }

    bucket.push({ key, value });
    this.count++;
  }

  public get(key: K): V | undefined {
    const idx = this.hash(key);
    const bucket = this.buckets[idx]!;

    for (const node of bucket) {
      if (node.key === key) {
        return node.value;
      }
    }
    return undefined;
  }

  public has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  public delete(key: K): boolean {
    const idx = this.hash(key);
    const bucket = this.buckets[idx]!;

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i]!.key === key) {
        bucket.splice(i, 1);
        this.count--;
        return true;
      }
    }
    return false;
  }

  public size(): number {
    return this.count;
  }

  public keys(): K[] {
    const allKeys: K[] = [];
    for (const bucket of this.buckets) {
      for (const node of bucket) {
        allKeys.push(node.key);
      }
    }
    return allKeys;
  }

  public values(): V[] {
    const allValues: V[] = [];
    for (const bucket of this.buckets) {
      for (const node of bucket) {
        allValues.push(node.value);
      }
    }
    return allValues;
  }
}
