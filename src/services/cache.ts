export const DEFAULT_CACHE_TTL_MS = 30 * 60 * 1000;
export const CACHE_PREFIX = "gh_contrib:";

export interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

function isSessionStorageAvailable(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
  } catch {
    return false;
  }
}

export function buildContributionCacheKey(username: string, year: number | string): string {
  const normalizedUser = username.trim().toLowerCase();
  const normalizedYear = String(year).trim().toLowerCase();
  return `${CACHE_PREFIX}${normalizedUser}:${normalizedYear}`;
}

export function getStoredItem<T>(key: string): T | null {
  if (!isSessionStorageAvailable()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const envelope = JSON.parse(raw) as CacheEnvelope<T>;

    if (
      !envelope ||
      typeof envelope !== "object" ||
      typeof envelope.timestamp !== "number" ||
      typeof envelope.ttl !== "number" ||
      !("data" in envelope)
    ) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    const isExpired = Date.now() - envelope.timestamp > envelope.ttl;
    if (isExpired) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    return envelope.data;
  } catch {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Falha silenciosa ao tentar limpar item corrompido
    }
    return null;
  }
}

export function setStoredItem<T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_CACHE_TTL_MS
): void {
  if (!isSessionStorageAvailable()) {
    return;
  }

  try {
    const envelope: CacheEnvelope<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    window.sessionStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Falha silenciosa em caso de cota de armazenamento excedida ou restricoes de sandbox
  }
}

export function removeStoredItem(key: string): void {
  if (!isSessionStorageAvailable()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Falha silenciosa
  }
}

export function clearContributionCache(prefix: string = CACHE_PREFIX): void {
  if (!isSessionStorageAvailable()) {
    return;
  }

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Falha silenciosa
  }
}

export function getContributionsFromCache<T>(
  username: string,
  year: number | string
): T | null {
  const key = buildContributionCacheKey(username, year);
  return getStoredItem<T>(key);
}

export function setContributionsInCache<T>(
  username: string,
  year: number | string,
  data: T,
  ttl: number = DEFAULT_CACHE_TTL_MS
): void {
  const key = buildContributionCacheKey(username, year);
  setStoredItem<T>(key, data, ttl);
}
