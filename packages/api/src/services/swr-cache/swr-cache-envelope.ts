import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';

import { getSwrCacheSecret } from './swr-cache-key';
import type { SwrCacheKey } from './swr-cache.type';

/**
 * Версия формата самой обёртки (не путать с версией схемы значения).
 *
 * 1 — значение зашифровано доменом (поле `data`). Только ЧИТАЕТСЯ: записи,
 *     сделанные до отказа от шифрования, не выбрасываем.
 * 2 — значение лежит открыто (поле `value`).
 *
 * От шифрования отказались осознанно (решение владельца 28.08.2026): ключом
 * был домен портала, который и так виден в адресе фрейма, то есть защиты оно
 * не давало — а AES на слепке в сотни килобайт стоил десятки миллисекунд
 * СИНХРОННО на главном потоке, при каждом чтении и записи. Хранилище и так
 * приватно для origin.
 */
const ENVELOPE_FORMAT = 2;
const ENVELOPE_FORMAT_ENCRYPTED = 1;

/**
 * Обёртка записи. Штамп времени и версия схемы лежат рядом со значением —
 * возраст записи узнаётся без разбора самого значения.
 */
type SwrEnvelope = {
    /** Формат обёртки */
    f: number;
    /** Версия схемы значения */
    v: number;
    /** Момент записи, ms epoch */
    savedAt: number;
    /**
     * Запись помечена протухшей вручную (`expire`). Значение остаётся живым и
     * читаемым — просто следующий `resolve` обязан сходить за новым. Поле
     * необязательное: записи, сделанные до его появления, читаются как есть.
     */
    stale?: boolean;
    /**
     * Момент последней явной инвалидации (`expire`), ms epoch — «эпоха» записи.
     *
     * Живёт дольше пометки `stale`: удачное обновление пометку снимает, а
     * отметку эпохи несёт дальше. По ней отличается ответ запроса,
     * стартовавшего ПОСЛЕ инвалидации (годный), от ответа запроса, который
     * висел в полёте ещё до неё (слепок «до» — записывать его нельзя).
     */
    expiredAt?: number;
    /** Значение как есть (формат 2). */
    value?: unknown;
    /** Значение, зашифрованное доменом портала (формат 1, только чтение). */
    data?: string;
};

/** Обёртка любого из поддерживаемых форматов — с её полем значения. */
const hasEnvelopeValue = (envelope: Partial<SwrEnvelope>): boolean =>
    (envelope.f === ENVELOPE_FORMAT && envelope.value !== undefined) ||
    (envelope.f === ENVELOPE_FORMAT_ENCRYPTED &&
        typeof envelope.data === 'string');

export type SwrDecodedEnvelope<T> = {
    value: T;
    savedAt: number;
    /** Запись помечена протухшей вручную — возраст здесь ни при чём */
    isForcedStale: boolean;
};

/**
 * Заворачивает значение в обёртку со штампом времени.
 *
 * `expiredAt` — эпоха прежней записи: новое значение пометку `stale` снимает,
 * но отметку инвалидации переносит на себя, иначе запоздавший ответ старого
 * запроса лёг бы поверх свежего как ни в чём не бывало.
 */
export const encodeSwrEnvelope = <T>(
    key: SwrCacheKey,
    value: T,
    savedAt: number,
    expiredAt?: number | null,
): string => {
    const envelope: SwrEnvelope = {
        f: ENVELOPE_FORMAT,
        v: key.version,
        savedAt,
        value,
    };

    if (typeof expiredAt === 'number' && Number.isFinite(expiredAt)) {
        envelope.expiredAt = expiredAt;
    }

    return JSON.stringify(envelope);
};

/**
 * Помечает запись протухшей, НЕ трогая значение: следующий `resolve` отдаст
 * её как прежде и тут же уйдёт за новым. Именно этим явная инвалидация
 * отличается от удаления — старое живёт до прихода нового, даже если сеть
 * в этот момент лежит.
 *
 * Вместе с пометкой проставляется `expiredAt` — момент инвалидации. По нему
 * `writeSwrCache` отличает ответ нового запроса от ответа того, что висел в
 * полёте ещё до нажатия ⟳: последний пометку снять не вправе.
 *
 * Работает по сырой обёртке: разбирать само значение незачем — в том числе
 * у записей старого, зашифрованного формата.
 * `null` — обёртка чужая или битая, помечать нечего.
 */
export const markSwrEnvelopeStale = (
    raw: string,
    expiredAt: number,
): string | null => {
    try {
        const envelope = JSON.parse(raw) as Partial<SwrEnvelope> | null;

        if (
            !envelope ||
            typeof envelope.savedAt !== 'number' ||
            !hasEnvelopeValue(envelope)
        ) {
            return null;
        }

        return JSON.stringify({ ...envelope, stale: true, expiredAt });
    } catch {
        return null;
    }
};

/**
 * Достаёт из сырой строки эпоху записи — момент последней явной инвалидации.
 * `null` — отметки нет (запись ни разу не помечали) или обёртка битая.
 */
export const readSwrEnvelopeExpiredAt = (raw: string): number | null => {
    try {
        const envelope = JSON.parse(raw) as Partial<SwrEnvelope> | null;
        const expiredAt = envelope?.expiredAt;

        return typeof expiredAt === 'number' && Number.isFinite(expiredAt)
            ? expiredAt
            : null;
    } catch {
        return null;
    }
};

/** Достаёт из сырой строки только штамп времени — без расшифровки значения. */
export const readSwrEnvelopeSavedAt = (raw: string): number | null => {
    try {
        const envelope = JSON.parse(raw) as Partial<SwrEnvelope> | null;
        const savedAt = envelope?.savedAt;

        return typeof savedAt === 'number' && Number.isFinite(savedAt)
            ? savedAt
            : null;
    } catch {
        return null;
    }
};

/**
 * Разбирает запись — в новом формате или в старом, зашифрованном.
 * `null` — обёртка чужая, версия схемы другая или значение не разобралось.
 * Запись при этом НЕ удаляется: старое живёт до прихода нового.
 *
 * Формат 1 читается, но не пишется: записи, сделанные до отказа от
 * шифрования, доживают свой срок и переписываются новым форматом при первом
 * же обновлении. Убрать ветку (вместе с зависимостью crypto-js здесь) можно,
 * когда предельный возраст записи заведомо истёк у всех.
 */
export const decodeSwrEnvelope = <T>(
    key: SwrCacheKey,
    raw: string,
): SwrDecodedEnvelope<T> | null => {
    try {
        const envelope = JSON.parse(raw) as Partial<SwrEnvelope> | null;

        if (
            !envelope ||
            envelope.v !== key.version ||
            typeof envelope.savedAt !== 'number'
        ) {
            return null;
        }

        const value = readEnvelopeValue<T>(key, envelope);

        if (value === undefined) {
            return null;
        }

        return {
            value,
            savedAt: envelope.savedAt,
            isForcedStale: envelope.stale === true,
        };
    } catch {
        return null;
    }
};

/** `undefined` — формат чужой или значение не разобралось. */
const readEnvelopeValue = <T>(
    key: SwrCacheKey,
    envelope: Partial<SwrEnvelope>,
): T | undefined => {
    if (envelope.f === ENVELOPE_FORMAT) {
        return envelope.value === undefined
            ? undefined
            : (envelope.value as T);
    }

    if (
        envelope.f !== ENVELOPE_FORMAT_ENCRYPTED ||
        typeof envelope.data !== 'string'
    ) {
        return undefined;
    }

    const decrypted = AES.decrypt(envelope.data, getSwrCacheSecret(key)).toString(
        encUtf8,
    );

    return decrypted ? (JSON.parse(decrypted) as T) : undefined;
};
