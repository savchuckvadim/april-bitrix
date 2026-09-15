import { createHash } from 'node:crypto';

/** Окно, в котором тот же бриф считается повтором. */
export const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

/** Отпечаток содержимого: одинаковый текст — одинаковый ключ. */
export const fingerprint = (text: string): string =>
    createHash('sha256').update(text).digest('hex');

/**
 * Память недавних отправок в пределах процесса: двойной клик, повторный
 * submit после таймаута сети, скрипт, шлющий одно и то же по кругу — всё
 * это не должно плодить сообщения в чате. Не хранилище: после рестарта
 * память пуста, и это нормально.
 */
export class RecentSubmissions {
    private readonly seen = new Map<string, number>();

    constructor(private readonly windowMs: number = DUPLICATE_WINDOW_MS) {}

    /** true — такой текст уже отправляли в пределах окна. */
    isDuplicate(text: string, now: number = Date.now()): boolean {
        this.evict(now);
        return this.seen.has(fingerprint(text));
    }

    remember(text: string, now: number = Date.now()): void {
        this.evict(now);
        this.seen.set(fingerprint(text), now);
    }

    private evict(now: number): void {
        this.seen.forEach((sentAt, key) => {
            if (now - sentAt >= this.windowMs) this.seen.delete(key);
        });
    }
}
