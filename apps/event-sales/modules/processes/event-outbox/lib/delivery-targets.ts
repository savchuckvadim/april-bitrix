import { FlowHelper } from '@/modules/processes/event/lib/api/flow-helper';
import type { EvFlowOperationStatus } from '@/modules/processes/event/model';

// type-only: цикл delivery-targets ⇄ direct-delivery существует лишь в типах
// и стирается компилятором (direct-delivery берёт отсюда FlowStatusCheck).
import type { DirectDeliveryOutcome } from './direct-delivery';
import {
    OUTBOX_DELIVERY_OUTCOME,
    type DirectAttemptMark,
    type OutboxDeferredStep,
    type OutboxDeliveryOutcome,
    type OutboxEnvelope,
} from './outbox-envelope';

/**
 * Реестр адресов доставки конверта. Список НЕ хранится в конверте — это
 * конфигурация кода: запасной тонкий бэк или зеркало добавится сюда строкой,
 * и дренаж подхватит их для уже записанных конвертов.
 */

export const PRIMARY_BACKEND_TARGET_ID = 'primary-backend';
export const DIRECT_BITRIX_TARGET_ID = 'direct-bitrix';

/** Исход обращения к цели. */
export interface DeliveryTargetResult {
    outcome: OutboxDeliveryOutcome;
    /** Деталь для attempts[] и логов: HTTP-статус, текст ошибки. */
    detail?: string;
    /**
     * Статус операции из ответа primary. Повторный POST уже принятой
     * операции возвращает её ТЕКУЩИЙ статус (бэк идемпотентен) — для
     * дренажа это тот же канал подтверждения, что и поллинг, без ожидания.
     */
    operationStatus?: EvFlowOperationStatus;
    /**
     * Данные прямого исполнения (только при `outcome: executed-direct`):
     * хвост досылки и свежесть слепка портала — движок кладёт их в конверт
     * (applyDirectExecution) и решает delivered | partial.
     */
    direct?: {
        deferred: OutboxDeferredStep[];
        /** null — возраст слепка неизвестен (см. DirectExecutionRecord). */
        portalSnapshotAt: number | null;
    };
    /**
     * Данные НЕПОЛНОГО прямого исполнения (только при
     * `outcome: direct-incomplete`): состав неприменившихся обязательных
     * команд и хвост досылки — движок кладёт их в конверт
     * (applyDirectIncomplete) и закрывает его видимым провалом.
     */
    directIncomplete?: {
        failedCommands: string[];
        deferred: OutboxDeferredStep[];
        portalSnapshotAt: number | null;
    };
    /**
     * Прямой путь успел зафиксировать «пишущий батч МОГ уйти» и всё равно
     * провалился: движок обязан перенести отметку в конверт вместе с
     * попыткой — иначе запись исхода из памяти затрёт её в хранилище, и
     * дренаж вернёт конверту primary (двойное исполнение).
     */
    directAttempted?: DirectAttemptMark;
}

/**
 * Контрольная сверка статуса операции ПЕРЕД повторной доставкой
 * `delivering`-конверта (дренаж): POST мог быть принят умершей вкладкой.
 * - `status`      — операция известна бэку, вот её текущее состояние;
 * - `not-found`   — эндпоинт жив, но операции нет (POST не долетел либо
 *                   статус истёк спустя час);
 * - `unavailable` — сеть/5xx: исход неизвестен, конверт не трогаем.
 */
export type FlowStatusCheck =
    | {
          kind: 'status';
          operationStatus: EvFlowOperationStatus;
          detail?: string;
      }
    | { kind: 'not-found' }
    | { kind: 'unavailable' };

/** Адрес доставки: у каждого — id для attempts[] и одна операция deliver. */
export interface DeliveryTarget {
    id: string;
    deliver: (envelope: OutboxEnvelope) => Promise<DeliveryTargetResult>;
    /**
     * Сверка статуса уже принятой операции — СУЩЕСТВУЮЩИЙ GET /flow/status,
     * тот же канал, что у поллинга FlowWatch. Есть только у primary: прямой
     * путь (А4) и зеркала своим статусом не владеют.
     */
    checkStatus?: (
        operationId: string,
        domain: string,
    ) => Promise<FlowStatusCheck>;
}

const getErrorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : String(error);

const getHttpStatus = (error: unknown): number | null => {
    if (typeof error !== 'object' || error === null) {
        return null;
    }
    const response = (error as { response?: { status?: unknown } }).response;
    const status = response?.status;

    return typeof status === 'number' ? status : null;
};

const isAxiosLikeError = (error: unknown): boolean =>
    typeof error === 'object' &&
    error !== null &&
    (error as { isAxiosError?: unknown }).isAxiosError === true;

/**
 * Классификация ошибки POST /event-sales/flow. Водораздел — БЫЛ ЛИ ОТВЕТ:
 * - 4xx — валидация: payload битый, повтор бессмыслен → `rejected`;
 * - 5xx — сервер ответил, значит был достижим и запрос МОГ долететь: бэк
 *   пишет статус операции и ставит job в очередь ДО исполнения flow
 *   (event-sales.controller), поэтому 504 от прокси штатно означает
 *   «апстрим принял, job поставлен». Повтор через primary безопасен
 *   (идемпотентность по operationId), а вот прямой путь по такому конверту
 *   запрещён — иначе поднявшийся воркер исполнит flow вторым →
 *   `server-error`;
 * - axios без ответа (обрыв, таймаут) — сервер молчал → `network-error`,
 *   ровно тот случай, ради которого прямой путь и существует;
 * - прочее (обёртка customAxios бросила по resultCode=ERROR при HTTP 200) —
 *   бэк ДОШЁЛ и отказал: авторетраи ни к чему → `rejected`.
 */
export const classifyFlowSendError = (error: unknown): DeliveryTargetResult => {
    const status = getHttpStatus(error);

    if (status !== null && status >= 400 && status < 500) {
        return {
            outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
            detail: `HTTP ${status}: ${getErrorMessage(error)}`,
        };
    }

    if (status !== null) {
        return {
            outcome: OUTBOX_DELIVERY_OUTCOME.serverError,
            detail: `HTTP ${status}: ${getErrorMessage(error)}`,
        };
    }

    if (isAxiosLikeError(error)) {
        return {
            outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
            detail: getErrorMessage(error),
        };
    }

    return {
        outcome: OUTBOX_DELIVERY_OUTCOME.rejected,
        detail: getErrorMessage(error),
    };
};

/**
 * Основной бэк: POST /event-sales/flow через существующий FlowHelper.
 * 2xx — операция принята; её исход конверту отдаст существующий поллинг
 * статуса (FlowWatch → markDelivered/markFailed), новых каналов нет.
 */
export const primaryBackendTarget: DeliveryTarget = {
    id: PRIMARY_BACKEND_TARGET_ID,
    deliver: async envelope => {
        try {
            const operation = await new FlowHelper().sendFlow(envelope.payload);

            return {
                outcome: OUTBOX_DELIVERY_OUTCOME.accepted,
                operationStatus: operation.status,
                detail: operation.error || undefined,
            };
        } catch (error) {
            return classifyFlowSendError(error);
        }
    },
    checkStatus: async (operationId, domain) => {
        try {
            const operation = await new FlowHelper().getFlowStatus(
                operationId,
                domain,
            );

            return {
                kind: 'status',
                operationStatus: operation.status,
                detail: operation.error || undefined,
            };
        } catch (error) {
            // 404 бэк шлёт честным NotFoundException: операции нет — POST не
            // долетел (или статус истёк спустя час). Всё прочее — эндпоинт
            // недоступен, исход операции неизвестен.
            return getHttpStatus(error) === 404
                ? { kind: 'not-found' }
                : { kind: 'unavailable' };
        }
    },
};

/**
 * Прямой исполнитель конверта: `dispatch(deliverEnvelopeDirect(envelope))`.
 * Функцией, а не импортом thunk'а: реестр — чистая конфигурация без Redux,
 * дистанцию до dispatch держат конвейеры (enqueueAndDeliver / drainOutbox).
 */
export type DirectEnvelopeRunner = (
    envelope: OutboxEnvelope,
) => Promise<DirectDeliveryOutcome>;

/**
 * Цель прямого исполнения в Битриксе (А4) поверх исполнителя
 * lib/direct-delivery. Допуск (доктрина №1: без accepted-попыток И статус
 * недоступен сетево) проверяет САМ исполнитель; отказ в допуске цель отдаёт
 * как `unavailable` — попытка не записывается, конверт ждёт primary, ровно
 * как у заглушки А3. Маппинг остальных исходов:
 * - `executed`         → `executed-direct` + хвост deferred (движок решит
 *                        delivered | partial);
 * - `duplicate-marker` → тоже `executed-direct`: пишущий батч этой операции
 *                        уходил раньше, хвост — из самого конверта;
 * - `incomplete`       → `direct-incomplete`: батч ушёл, но обязательные
 *                        команды не подтвердились — конверт закрывается
 *                        видимым провалом с составом упавших команд;
 * - `failed`           → `network-error`: конверт остаётся
 *                        failed-ретраебельным, дренаж продолжит пробовать
 *                        primary (и прямой путь — после его сетевых ошибок).
 */
export const createDirectBitrixTarget = (
    runDirect: DirectEnvelopeRunner | null,
): DeliveryTarget => ({
    id: DIRECT_BITRIX_TARGET_ID,
    deliver: async envelope => {
        if (!runDirect) {
            return {
                outcome: OUTBOX_DELIVERY_OUTCOME.unavailable,
                detail: 'прямой путь не подключён (реестр без исполнителя)',
            };
        }

        const outcome = await runDirect(envelope);

        switch (outcome.status) {
            case 'refused':
                return {
                    outcome: OUTBOX_DELIVERY_OUTCOME.unavailable,
                    detail: outcome.detail
                        ? `допуск прямого пути: ${outcome.reason} (${outcome.detail})`
                        : `допуск прямого пути: ${outcome.reason}`,
                };
            case 'executed':
                return {
                    outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
                    direct: {
                        deferred: outcome.deferred,
                        portalSnapshotAt: outcome.portalSnapshotAt,
                    },
                };
            case 'duplicate-marker':
                return {
                    outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
                    detail: 'duplicate-marker: исполнено напрямую ранее',
                    direct: {
                        deferred: outcome.deferred,
                        portalSnapshotAt: null,
                    },
                };
            case 'incomplete':
                return {
                    outcome: OUTBOX_DELIVERY_OUTCOME.directIncomplete,
                    detail: outcome.detail,
                    directAttempted: outcome.directAttempted,
                    directIncomplete: {
                        failedCommands: outcome.failedCommands,
                        deferred: outcome.deferred,
                        portalSnapshotAt: outcome.portalSnapshotAt,
                    },
                };
            case 'failed':
                return {
                    outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
                    detail: outcome.detail,
                    directAttempted: outcome.directAttempted,
                };
        }
    },
});

/**
 * Цель direct-bitrix без исполнителя — отвечает `unavailable`. Живёт для
 * вызовов реестра вне Redux-конвейера (движку без явных целей) и тестов.
 */
export const directBitrixTarget: DeliveryTarget =
    createDirectBitrixTarget(null);

/**
 * Конверт, которому primary-backend ЗАПРЕЩЁН (прямой запрет плана А5:
 * «слать ИСХОДНЫЙ payload на бэк после прямого исполнения НЕЛЬЗЯ»).
 *
 * Таких два вида, и оба — про уже случившееся прямое исполнение:
 * `executedDirect` — ядро исполнено и хвост записан; `directAttempted` —
 * пишущий батч МОГ уйти, а исход неизвестен. Во втором случае бэк прямого
 * исполнения не видел и маркер не читает: получив исходный payload, он
 * завёл бы вторую план-задачу, второй комментарий истории, повторно закрыл
 * задачу, снова двинул сделку и создал вторую сделку «Презентации».
 */
export const isPrimaryForbidden = (envelope: OutboxEnvelope): boolean =>
    Boolean(envelope.directAttempted) || envelope.executedDirect === true;

/**
 * Цели, допустимые конверту: у «прямо тронутого» primary вычеркнут из
 * реестра — ни свежая отправка, ни дренаж не могут его выбрать. Порядок
 * остальных сохраняется (фолбэк-пас движка ходит по индексам этого списка).
 */
export const selectAllowedTargets = (
    envelope: OutboxEnvelope,
    targets: DeliveryTarget[],
): DeliveryTarget[] =>
    isPrimaryForbidden(envelope)
        ? targets.filter(target => target.id !== PRIMARY_BACKEND_TARGET_ID)
        : targets;

/**
 * Встройки, где отчёт по умолчанию идёт ПРЯМЫМ путём (канарейка А5.5,
 * решение владельца 31.08).
 *
 * Зачем: обкатать прямой путь на живых людях с минимальным радиусом
 * поражения. Вкладка карточки — самая узкая встройка: там менеджер
 * отчитывается по одному событию, а не ведёт список, и цена сбоя ниже
 * всего. Служебный хвост при живом сервере доезжает секундами позже
 * обычным пасом досылки (А5), так что отчётность не отстаёт.
 *
 * Выключатель — эта константа: пустой список возвращает всем режимам
 * прежний порядок «сервер → прямой путь».
 */
const DIRECT_FIRST_PLACEMENTS: readonly string[] = ['DETAIL_TAB'];

/** Идёт ли этой встройке прямой путь первым. */
export const isDirectFirstPlacement = (
    placement: string | null | undefined,
): boolean =>
    Boolean(placement) &&
    DIRECT_FIRST_PLACEMENTS.some(mode => placement!.includes(mode));

/** Как реестру достучаться до прямого исполнителя (Redux-часть снаружи). */
export interface DeliveryTargetsContext {
    /** Не передан — цель direct-bitrix числится, но отвечает unavailable. */
    deliverDirect?: DirectEnvelopeRunner;
    /**
     * Встройка приложения (`app.bitrix.placement`). Нужна канарейке А5.5:
     * в узких встройках прямой путь идёт первым.
     */
    placement?: string | null;
}

/**
 * Список адресов: основной бэк, затем прямой исполнитель (А4). Порядок —
 * это приоритет: обычно primary первый, и прямой путь подбирает конверт
 * лишь после исчерпания его сетевых попыток (фолбэк-пас движка). В
 * канареечной встройке (А5.5) порядок обратный: прямой путь первым, сервер
 * — страховкой. Запасной тонкий бэк или зеркало добавятся сюда строкой.
 */
export const getDeliveryTargets = (
    context: DeliveryTargetsContext = {},
): DeliveryTarget[] => {
    const direct = context.deliverDirect
        ? createDirectBitrixTarget(context.deliverDirect)
        : directBitrixTarget;

    return isDirectFirstPlacement(context.placement)
        ? [direct, primaryBackendTarget]
        : [primaryBackendTarget, direct];
};
