class SearchHistoryStore {
  private history: string[] = [];
  private listeners: (() => void)[] = [];

  getHistory(): string[] {
    return this.history;
  }

  addSearch(idOrQuery: string) {
    if (!idOrQuery || !idOrQuery.trim()) return;
    this.history = [idOrQuery, ...this.history.filter((h) => h !== idOrQuery)].slice(0, 8);
    this.notify();
  }

  removeSearches(idsOrQueries: string[]) {
    this.history = this.history.filter((h) => !idsOrQueries.includes(h));
    this.notify();
  }

  clearHistory() {
    this.history = [];
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const searchHistoryStore = new SearchHistoryStore();
