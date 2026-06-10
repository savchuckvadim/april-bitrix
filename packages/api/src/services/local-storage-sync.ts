const DEFAULT_PREFIX = "konstructor:";

export function getLocalStorageString(key: string, prefix: string = DEFAULT_PREFIX): string | null {
    try {
        if (typeof window === "undefined") {
            return null;
        }
        return window.localStorage.getItem(prefix + key);
    } catch {
        return null;
    }
}

export function setLocalStorageString(key: string, value: string, prefix: string = DEFAULT_PREFIX): void {
    try {
        if (typeof window === "undefined") {
            return;
        }
        window.localStorage.setItem(prefix + key, value);
    } catch {
        // quota, private mode, disabled storage
    }
}

export function removeLocalStorageKey(key: string, prefix: string = DEFAULT_PREFIX): void {
    try {
        if (typeof window === "undefined") {
            return;
        }
        window.localStorage.removeItem(prefix + key);
    } catch {
        // ignore
    }
}

/** Returns stored value only when it equals one of `allowed`; otherwise null. */
export function getLocalStorageLiteralUnion<T extends string>(
    key: string,
    allowed: readonly T[],
    prefix: string = DEFAULT_PREFIX,
): T | null {
    const raw = getLocalStorageString(key, prefix);
    if (raw === null) {
        return null;
    }
    return (allowed as readonly string[]).includes(raw) ? (raw as T) : null;
}

export function getLocalStorageJson<T>(key: string, prefix: string = DEFAULT_PREFIX): T | null {
    const raw = getLocalStorageString(key, prefix);
    if (raw === null || raw === "") {
        return null;
    }
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export function setLocalStorageJson(key: string, value: unknown, prefix: string = DEFAULT_PREFIX): void {
    try {
        if (typeof window === "undefined") {
            return;
        }
        window.localStorage.setItem(prefix + key, JSON.stringify(value));
    } catch {
        // quota, private mode, disabled storage
    }
}
