export interface ElementRectSnapshot {
  readonly id: string;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export class VisualizerElementRegistry {
  private readonly elements = new Map<string, Element>();
  private readinessListeners = new Set<() => void>();

  public register(id: string, element: Element | null): void {
    if (element) {
      const existing = this.elements.get(id);
      if (existing === element) return;
      this.elements.set(id, element);
      this.notifyReady();
    } else if (this.elements.delete(id)) {
      this.notifyReady();
    }
  }

  public get(id: string): Element | undefined {
    return this.elements.get(id);
  }

  public has(id: string): boolean {
    return this.elements.has(id);
  }

  public entries(): IterableIterator<[string, Element]> {
    return this.elements.entries();
  }

  public getAll(): ReadonlyMap<string, Element> {
    return this.elements;
  }

  public size(): number {
    return this.elements.size;
  }

  public clear(): void {
    this.elements.clear();
  }

  public measureRects(ids?: readonly string[]): Map<string, ElementRectSnapshot> {
    const snapshots = new Map<string, ElementRectSnapshot>();
    const targetIds = ids ? ids : [...this.elements.keys()];
    for (const id of targetIds) {
      const element = this.elements.get(id);
      if (!element || typeof element.getBoundingClientRect !== "function") continue;
      const rect = element.getBoundingClientRect();
      snapshots.set(id, {
        id,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }
    return snapshots;
  }

  public subscribe(listener: () => void): () => void {
    this.readinessListeners.add(listener);
    return () => {
      this.readinessListeners.delete(listener);
    };
  }

  private notifyReady(): void {
    for (const listener of this.readinessListeners) listener();
  }
}
