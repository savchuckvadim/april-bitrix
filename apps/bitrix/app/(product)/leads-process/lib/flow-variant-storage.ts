import { LeadsFlowVariant } from '../constants/types';

const KEY_PREFIX = 'leads-flow-variant-';
const CHANGE_EVENT = 'leads-flow-variant-change';

const storageKey = (flowId: string) => `${KEY_PREFIX}${flowId}`;

const notifyChange = () => {
    window.dispatchEvent(new Event(CHANGE_EVENT));
};

/** Читает сохранённый вариант схемы (client-only). */
export const loadFlowVariant = (flowId: string): LeadsFlowVariant | null => {
    try {
        const raw = localStorage.getItem(storageKey(flowId));
        return raw ? (JSON.parse(raw) as LeadsFlowVariant) : null;
    } catch {
        return null;
    }
};

/** Сохраняет вариант схемы и оповещает подписчиков. */
export const saveFlowVariant = (variant: LeadsFlowVariant): void => {
    try {
        localStorage.setItem(
            storageKey(variant.flowId),
            JSON.stringify(variant),
        );
        notifyChange();
    } catch {
        // приватный режим — работаем без сохранения
    }
};

/** Удаляет вариант схемы. */
export const removeFlowVariant = (flowId: string): void => {
    try {
        localStorage.removeItem(storageKey(flowId));
        notifyChange();
    } catch {
        // приватный режим
    }
};

/** Id схем, у которых есть сохранённый вариант клиента. */
export const listFlowVariantIds = (): string[] => {
    try {
        const ids: string[] = [];
        for (let index = 0; index < localStorage.length; index++) {
            const key = localStorage.key(index);
            if (key?.startsWith(KEY_PREFIX)) {
                ids.push(key.slice(KEY_PREFIX.length));
            }
        }
        return ids;
    } catch {
        return [];
    }
};

/** Подписка на изменения вариантов (для счётчиков/списков). */
export const subscribeFlowVariants = (listener: () => void): (() => void) => {
    window.addEventListener(CHANGE_EVENT, listener);
    return () => window.removeEventListener(CHANGE_EVENT, listener);
};
