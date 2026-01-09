type Entry = {
  cartId: string;
  expiresAt: number;
};

export class InMemoryContextStore {
  private store = new Map<string, Entry>();
  private ttlMs = 60_000;

  set(sessionId: string, cartId: string) {
    this.store.set(sessionId, {
      cartId,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  get(sessionId: string): string | null {
    const entry = this.store.get(sessionId);
    if (!entry) return null;

    if (entry.expiresAt < Date.now()) {
      this.store.delete(sessionId);
      return null;
    }
    return entry.cartId;
  }

  delete(sessionId: string) {
    this.store.delete(sessionId);
  }
}
