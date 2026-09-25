import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@trend_pending_timer_';
const DEFAULT_DURATION_SECONDS = 180; // 3 minutes

class PendingTimerStore {
  private startTimes: Map<string, number> = new Map();
  private isLoaded: boolean = false;

  constructor() {
    this.init();
  }

  private isServer(): boolean {
    return Platform.OS === 'web' && typeof window === 'undefined';
  }

  private async init() {
    if (this.isServer()) {
      return;
    }
    try {
      const keys = await AsyncStorage.getAllKeys();
      const timerKeys = keys.filter((k) => k.startsWith(STORAGE_PREFIX));
      if (timerKeys.length > 0) {
        await Promise.all(
          timerKeys.map(async (k) => {
            try {
              const v = await AsyncStorage.getItem(k);
              if (v) {
                const id = k.replace(STORAGE_PREFIX, '');
                const parsed = parseInt(v, 10);
                if (!isNaN(parsed) && parsed > 0) {
                  this.startTimes.set(id, parsed);
                }
              }
            } catch {}
          })
        );
      }
      this.isLoaded = true;
    } catch (e) {
      // Safe fallback in SSR
    }
  }

  public getStartTime(id: string): number | undefined {
    return this.startTimes.get(id);
  }

  public getOrSetStartTime(id: string, explicitCreatedAt?: number): number {
    const existing = this.startTimes.get(id);
    if (existing && existing > 0) {
      return existing;
    }

    const startTime = explicitCreatedAt && explicitCreatedAt > 0 ? explicitCreatedAt : Date.now();
    this.startTimes.set(id, startTime);
    if (!this.isServer()) {
      AsyncStorage.setItem(`${STORAGE_PREFIX}${id}`, startTime.toString()).catch(() => {});
    }
    return startTime;
  }

  public getRemainingSeconds(id: string, totalSeconds = DEFAULT_DURATION_SECONDS, explicitCreatedAt?: number): number {
    const startTime = this.getOrSetStartTime(id, explicitCreatedAt);
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    return Math.max(0, totalSeconds - elapsedSeconds);
  }

  public resetTimer(id: string) {
    this.startTimes.delete(id);
    if (!this.isServer()) {
      AsyncStorage.removeItem(`${STORAGE_PREFIX}${id}`).catch(() => {});
    }
  }

  public expireTimer(id: string, totalSeconds = DEFAULT_DURATION_SECONDS) {
    const expiredStart = Date.now() - (totalSeconds + 10) * 1000;
    this.startTimes.set(id, expiredStart);
    if (!this.isServer()) {
      AsyncStorage.setItem(`${STORAGE_PREFIX}${id}`, expiredStart.toString()).catch(() => {});
    }
  }
}

export const pendingTimerStore = new PendingTimerStore();
