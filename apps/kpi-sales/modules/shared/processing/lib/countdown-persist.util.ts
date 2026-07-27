/**
 * Модульный персист старта обратного отсчёта: таймер не сбрасывается,
 * если экран Processing кратко размонтировали и смонтировали заново
 * (например, fallback у next/dynamic при переходе к отчёту).
 *
 * release() удаляет старт с задержкой: ремаунт в пределах grace-окна
 * продолжает отсчёт, а следующая полноценная сборка отчёта начинает с нуля.
 */

const starts = new Map<string, number>();
const pendingReleases = new Map<string, ReturnType<typeof setTimeout>>();

export const acquireCountdownStart = (key: string): number => {
    const pending = pendingReleases.get(key);
    if (pending) {
        clearTimeout(pending);
        pendingReleases.delete(key);
    }

    const existing = starts.get(key);
    if (existing !== undefined) {
        return existing;
    }

    const now = Date.now();
    starts.set(key, now);
    return now;
};

export const releaseCountdownStart = (key: string, graceMs = 5000): void => {
    const prev = pendingReleases.get(key);
    if (prev) {
        clearTimeout(prev);
    }
    pendingReleases.set(
        key,
        setTimeout(() => {
            starts.delete(key);
            pendingReleases.delete(key);
        }, graceMs),
    );
};
