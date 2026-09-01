import { getKvStorage } from '@workspace/api';

import {
    OUTBOX_ENVELOPE_STATE,
    OUTBOX_ENVELOPE_VERSION,
    isRetryableFailure,
    type OutboxEnvelope,
} from './outbox-envelope';

/**
 * Стор конвертов поверх общего KV-слоя (`getKvStorage`: IndexedDB →
 * localStorage → сквозной режим). Outbox сознательно НЕ на swrCache:
 * TTL-семантика кэша («протухло — можно перечитать») конверту вредна —
 * конверт живёт по своей машине состояний, а не по свежести.
 *
 * Ключ: `evob:{domain}:{operationId}` — соседний портал в том же браузере
 * своих конвертов не видит. Хранилища может не быть вовсе (kind `none`) —
 * тогда записи уходят в никуда, а доставка работает по конверту в памяти
 * (см. outbox-delivery): поведение отправки не хуже сегодняшнего.
 */

const KEY_PREFIX = 'evob:';

export const buildOutboxKey = (domain: string, operationId: string): string =>
    `${KEY_PREFIX}${domain}:${operationId}`;

const buildDomainPrefix = (domain: string): string => `${KEY_PREFIX}${domain}:`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

/**
 * Похоже ли прочитанное на конверт. Минимум полей: ровно столько, сколько
 * нужно, чтобы конверт ЛЮБОЙ версии можно было адресовать и не трогать.
 */
const isEnvelopeShaped = (value: unknown): value is OutboxEnvelope =>
    isRecord(value) &&
    typeof value.v === 'number' &&
    typeof value.operationId === 'string' &&
    typeof value.domain === 'string' &&
    typeof value.state === 'string';

/**
 * Миграция-заглушка при чтении.
 *
 * Своя версия — нормализуем необязательные поля и отдаём. Незнакомая версия
 * (например, соседняя вкладка с более новым кодом уже пишет v2) — конверт
 * отдаётся КАК ЕСТЬ, без выброса и без порчи записи: доставку и уборку таких
 * конвертов пропускают проверки `v === OUTBOX_ENVELOPE_VERSION` в
 * outbox-delivery и planOutboxRetention. Появится v2 — сюда встанет честный
 * маппинг v1 → v2.
 */
const migrateOutboxEnvelope = (envelope: OutboxEnvelope): OutboxEnvelope => {
    if (envelope.v !== OUTBOX_ENVELOPE_VERSION) {
        return envelope;
    }

    return {
        ...envelope,
        attempts: Array.isArray(envelope.attempts) ? envelope.attempts : [],
        nextAttemptAt:
            typeof envelope.nextAttemptAt === 'number'
                ? envelope.nextAttemptAt
                : null,
    };
};

/** Разбор сырой записи. Мусор (битый JSON, не-конверт) — null, не выброс. */
export const parseOutboxEnvelope = (
    raw: string | null,
): OutboxEnvelope | null => {
    if (raw === null) {
        return null;
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch {
        console.warn(
            '[event-outbox] запись конверта не разобралась — пропущена',
        );
        return null;
    }

    if (!isEnvelopeShaped(parsed)) {
        console.warn('[event-outbox] запись не похожа на конверт — пропущена');
        return null;
    }

    return migrateOutboxEnvelope(parsed);
};

export const readOutboxEnvelope = async (
    domain: string,
    operationId: string,
): Promise<OutboxEnvelope | null> => {
    const storage = await getKvStorage();

    return parseOutboxEnvelope(
        await storage.get(buildOutboxKey(domain, operationId)),
    );
};

/** Запись конверта. `false` — хранилище не приняло (quota / kind `none`). */
export const writeOutboxEnvelope = async (
    envelope: OutboxEnvelope,
): Promise<boolean> => {
    const storage = await getKvStorage();

    return storage.set(
        buildOutboxKey(envelope.domain, envelope.operationId),
        JSON.stringify(envelope),
    );
};

export const removeOutboxEnvelope = async (
    domain: string,
    operationId: string,
): Promise<void> => {
    const storage = await getKvStorage();

    await storage.remove(buildOutboxKey(domain, operationId));
};

/** Все конверты домена. Мусорные записи молча пропускаются. */
export const listOutboxEnvelopes = async (
    domain: string,
): Promise<OutboxEnvelope[]> => {
    const storage = await getKvStorage();
    const prefix = buildDomainPrefix(domain);
    const keys = (await storage.keys()).filter(key => key.startsWith(prefix));
    const result: OutboxEnvelope[] = [];

    for (const key of keys) {
        const envelope = parseOutboxEnvelope(await storage.get(key));

        if (envelope) {
            result.push(envelope);
        }
    }

    return result;
};

/**
 * Поиск конверта по одному operationId — для markDelivered/markFailed, куда
 * интеграция из FlowWatch домен не передаёт. Сначала пробуем подсказанный
 * домен (обычный путь), затем скан ключей: operationId — UUID, коллизий нет.
 */
export const findOutboxEnvelope = async (
    operationId: string,
    domainHint?: string,
): Promise<OutboxEnvelope | null> => {
    if (domainHint) {
        const direct = await readOutboxEnvelope(domainHint, operationId);

        if (direct) {
            return direct;
        }
    }

    const storage = await getKvStorage();
    const suffix = `:${operationId}`;
    const key = (await storage.keys()).find(
        candidate =>
            candidate.startsWith(KEY_PREFIX) && candidate.endsWith(suffix),
    );

    return key ? parseOutboxEnvelope(await storage.get(key)) : null;
};

/**
 * Терминальный конверт (delivered и терминально-отвергнутый failed) держим
 * сутки — след для диагностики, дедупа и разбора отказов.
 */
export const OUTBOX_DELIVERED_TTL_MS = 24 * 60 * 60 * 1000;

/** Кап записей на домен: столько конвертов дренаж соглашается хранить. */
export const OUTBOX_DOMAIN_CAP = 50;

export interface OutboxRetentionPlan {
    /**
     * Что удалить: протухшие терминальные (delivered / отвергнутые failed)
     * и старейшие терминальные сверх капа.
     */
    removeOperationIds: string[];
    /**
     * Сколько записей осталось сверх капа ПОСЛЕ уборки. Это недоставленные —
     * их удалять нельзя (потеря отчётов), дренаж только предупреждает.
     */
    overflow: number;
}

/**
 * Чистый план уборки домена. Терминальные конверты — delivered и
 * терминально-отвергнутые failed (rejected: авторетраев нет,
 * кросс-сессионного «Повторить» нет, досылка им больше не светит) — старше
 * 24ч удаляются; если записей всё ещё больше капа — удаляются старейшие
 * терминальные. Недоставленные (pending / delivering / partial / сетевой
 * failed) не удаляются никогда. Конверты чужой версии схемы не трогаем вовсе
 * (их писал другой код), но место в капе они занимают.
 */
export const planOutboxRetention = (
    envelopes: OutboxEnvelope[],
    now: number,
): OutboxRetentionPlan => {
    const removeOperationIds: string[] = [];
    const isOwnVersion = (envelope: OutboxEnvelope): boolean =>
        envelope.v === OUTBOX_ENVELOPE_VERSION;
    const isTerminallyRejected = (envelope: OutboxEnvelope): boolean =>
        envelope.state === OUTBOX_ENVELOPE_STATE.failed &&
        !isRetryableFailure(envelope);
    /** Кого ретеншн вправе удалить: терминальные — исход уже случился. */
    const isRemovable = (envelope: OutboxEnvelope): boolean =>
        envelope.state === OUTBOX_ENVELOPE_STATE.delivered ||
        isTerminallyRejected(envelope);

    for (const envelope of envelopes) {
        if (
            isOwnVersion(envelope) &&
            isRemovable(envelope) &&
            now - envelope.updatedAt >= OUTBOX_DELIVERED_TTL_MS
        ) {
            removeOperationIds.push(envelope.operationId);
        }
    }

    const removed = new Set(removeOperationIds);
    const remaining = envelopes.filter(
        envelope => !removed.has(envelope.operationId),
    );
    let excess = remaining.length - OUTBOX_DOMAIN_CAP;

    if (excess > 0) {
        const removableOldestFirst = remaining
            .filter(envelope => isOwnVersion(envelope) && isRemovable(envelope))
            .sort((a, b) => a.updatedAt - b.updatedAt);

        for (const envelope of removableOldestFirst) {
            if (excess <= 0) {
                break;
            }
            removeOperationIds.push(envelope.operationId);
            excess -= 1;
        }
    }

    return { removeOperationIds, overflow: Math.max(excess, 0) };
};
