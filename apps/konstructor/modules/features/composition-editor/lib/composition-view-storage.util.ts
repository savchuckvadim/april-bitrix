import type { CompositionViewOwner, CompositionViewSettings } from '../model/types';
import { parseCompositionView } from './composition-view.util';

/**
 * Копия настройки вида в браузере: синхронное чтение — экран сразу в нужном
 * виде, без ожидания сети. У пользователя источник истины — сервер (см.
 * CompositionViewThunk), без владельца копия и есть настройка. Хранилище может
 * быть недоступно (приватный режим, запрет сторонних данных во фрейме) — тогда
 * настройка просто приходит с сервера.
 */
const storageKey = (owner: CompositionViewOwner | null): string =>
    owner
        ? `konstructor:composition-view:${owner.domain}:${owner.bxUserId}`
        : 'konstructor:composition-view:public';

export const readStoredCompositionView = (
    owner: CompositionViewOwner | null,
): CompositionViewSettings | null => {
    try {
        const raw = localStorage.getItem(storageKey(owner));
        return raw ? parseCompositionView(JSON.parse(raw)) : null;
    } catch {
        return null;
    }
};

export const storeCompositionView = (
    owner: CompositionViewOwner | null,
    value: CompositionViewSettings,
): void => {
    try {
        localStorage.setItem(storageKey(owner), JSON.stringify(value));
    } catch {
        // копия необязательна: настройка всё равно на сервере
    }
};
