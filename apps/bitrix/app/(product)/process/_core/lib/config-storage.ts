/**
 * Хранилище конфигурации процесса: localStorage + оповещение через window-событие.
 * Снапшот кэшируется
 * в модуле — так его можно отдавать в useSyncExternalStore без лишних рендеров.
 *
 * Конфигурация живёт вне React намеренно: её читают все страницы раздела
 * (схема, симулятор, теория), и переход между ними не должен её терять.
 */

import { DEFAULT_PROCESS_CONFIG } from '../constants/presets';
import { ProcessConfig } from '../types';

const KEY_PREFIX = 'april-process-config-';
const CHANGE_EVENT = 'april-process-config-change';

const storageKey = (processId: string) => `${KEY_PREFIX}${processId}`;

/**
 * Кэш снапшотов по процессам. useSyncExternalStore требует стабильную ссылку:
 * пока конфигурация не поменялась, getSnapshot обязан вернуть тот же объект.
 */
const cache = new Map<string, ProcessConfig>();

const clampPct = (value: unknown): number =>
    typeof value === 'number' && Number.isFinite(value)
        ? Math.min(Math.max(Math.round(value), 0), 100)
        : 0;

/** Хранилищу нельзя доверять: там может лежать что угодно от прошлых версий. */
const sanitize = (raw: unknown): ProcessConfig => {
    if (!raw || typeof raw !== 'object') return DEFAULT_PROCESS_CONFIG;

    const source = raw as Partial<ProcessConfig>;
    const answers =
        source.answers && typeof source.answers === 'object'
            ? Object.fromEntries(
                  Object.entries(source.answers).filter(
                      ([, value]) => typeof value === 'string',
                  ),
              )
            : {};

    return {
        leadPct: clampPct(source.leadPct),
        dealPct: clampPct(source.dealPct),
        answers,
    };
};

const notifyChange = () => {
    window.dispatchEvent(new Event(CHANGE_EVENT));
};

/** Текущий снапшот. До первой гидратации — значения по умолчанию. */
export const getProcessConfig = (processId: string): ProcessConfig =>
    cache.get(processId) ?? DEFAULT_PROCESS_CONFIG;

/**
 * Поднимает конфигурацию из localStorage в кэш. Вызывается один раз из эффекта,
 * а не при импорте: на сервере localStorage нет, и разметка должна совпасть.
 */
export const hydrateProcessConfig = (processId: string): void => {
    try {
        const raw = localStorage.getItem(storageKey(processId));
        if (!raw) return;

        const next = sanitize(JSON.parse(raw));
        const current = getProcessConfig(processId);
        if (
            next.leadPct === current.leadPct &&
            next.dealPct === current.dealPct &&
            JSON.stringify(next.answers) === JSON.stringify(current.answers)
        ) {
            return;
        }

        cache.set(processId, next);
        notifyChange();
    } catch {
        // повреждённое хранилище — остаёмся на значениях по умолчанию
    }
};

/** Записывает конфигурацию и оповещает подписчиков. */
export const saveProcessConfig = (
    processId: string,
    config: ProcessConfig,
): void => {
    const next = sanitize(config);
    cache.set(processId, next);

    try {
        localStorage.setItem(storageKey(processId), JSON.stringify(next));
    } catch {
        // приватный режим — работаем без сохранения
    }

    notifyChange();
};

/** Сбрасывает конфигурацию к значениям по умолчанию. */
export const resetProcessConfig = (processId: string): void => {
    cache.delete(processId);

    try {
        localStorage.removeItem(storageKey(processId));
    } catch {
        // приватный режим
    }

    notifyChange();
};

/** Подписка на изменения конфигурации. */
export const subscribeProcessConfig = (listener: () => void): (() => void) => {
    window.addEventListener(CHANGE_EVENT, listener);
    return () => window.removeEventListener(CHANGE_EVENT, listener);
};
