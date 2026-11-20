import {
    DEAL_MOVEMENT_CHANGES_SHOWN,
    DEAL_MOVEMENT_MODE_TITLE,
    DEAL_MOVEMENT_PHASE_TITLE,
    DEAL_MOVEMENT_REQUESTER_TITLE,
    DEAL_MOVEMENT_RUNNING_WINDOW_MS,
    DEAL_MOVEMENT_STATUS_ORDER,
    DEAL_MOVEMENT_STATUS_TITLE,
} from '../consts/deal-movement.const';
import type {
    DealMovementChange,
    DealMovementCounts,
    DealMovementRunResult,
    DealMovementRunStatus,
    DealMovementSnapshot,
    LaunchOutcome,
} from '../model';

/**
 * Карточка «Движение сделок»: ответы ручек — человеческим текстом. Коды
 * статусов, фаз и режимов на экран не попадают. Чистые функции под vitest.
 */

/** 'YYYY-MM-DD' → 'ДД.ММ.ГГГГ'; не дата — как есть. */
export function dealMovementDayLabel(day: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
    return match ? `${match[3]}.${match[2]}.${match[1]}` : day;
}

/** Момент ISO → 'ДД.ММ.ГГГГ ЧЧ:ММ' по часам браузера; не дата — как есть. */
export function dealMovementMomentLabel(iso: string): string {
    const time = Date.parse(iso);
    if (Number.isNaN(time)) return iso;
    return new Date(time).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const amountLabel = (amount: number): string =>
    `${amount.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽`;

/**
 * «Движется — 7000 · Без продвижения — 1500 · Без внимания — 1100 ·
 * Вернулась назад — 12 · Под риском — 500». Статуса нет в ответе (старая
 * сборка бэка до «Без внимания») — 0.
 */
export function dealMovementCountsText(
    counts: Partial<DealMovementCounts>,
): string {
    return DEAL_MOVEMENT_STATUS_ORDER.map(
        status =>
            `${DEAL_MOVEMENT_STATUS_TITLE[status]} — ${counts[status] ?? 0}`,
    ).join(' · ');
}

/** «открытых сделок 9012, оценено 9000». */
export const dealMovementTotalsText = (
    item: Pick<DealMovementSnapshot, 'openTotal' | 'evaluated'>,
): string =>
    `открытых сделок ${item.openTotal}, оценено ${item.evaluated}`;

/** Итог законченного прогона: «Итог: открытых сделок 9012, оценено 9000». */
export const dealMovementRunTotalsText = (
    run: Pick<DealMovementRunStatus, 'openTotal' | 'evaluated'>,
): string => `Итог: ${dealMovementTotalsText(run)}`;

/** Заголовок сохранённого счёта: день, открыто и оценено. */
export function dealMovementSnapshotHeadline(
    snapshot: DealMovementSnapshot,
): string {
    return `Счёт за ${dealMovementDayLabel(snapshot.day)}: ${dealMovementTotalsText(snapshot)}`;
}

/** Строка смен: сколько сменили статус и сколько увидели впервые. */
export function dealMovementChangesLine(
    item: Pick<DealMovementSnapshot, 'baseline' | 'firstSeen'> & {
        changed: number;
    },
): string {
    return item.baseline
        ? `Смены статуса не считались, впервые увидели сделок: ${item.firstSeen}`
        : `Сменили статус: ${item.changed}, впервые увидели: ${item.firstSeen}`;
}

/** Смена статуса одной сделки — словами. */
export interface DealMovementChangeView {
    dealId: string;
    title: string;
    /** «Движется → Под риском». */
    transition: string;
    /** Причины нового статуса через «; »; пусто — причин нет. */
    reasons: string;
    /** «150 000 ₽»; null — сумма не указана или ноль. */
    amount: string | null;
    /** Смена записана в ленту сделки (пометка «записано в ленту»). */
    notified: boolean;
}

export function dealMovementChangeView(
    change: DealMovementChange,
): DealMovementChangeView {
    return {
        dealId: change.dealId,
        title: change.title,
        transition:
            `${DEAL_MOVEMENT_STATUS_TITLE[change.from]} → ` +
            DEAL_MOVEMENT_STATUS_TITLE[change.to],
        reasons: change.reasons.join('; '),
        amount:
            change.amount !== null && change.amount > 0
                ? amountLabel(change.amount)
                : null,
        notified: change.notified === true,
    };
}

/** Смены для показа: первые N и сколько осталось за кадром («и ещё N»). */
export function dealMovementShownChanges(snapshot: DealMovementSnapshot): {
    shown: DealMovementChangeView[];
    more: number;
} {
    const shown = snapshot.changes
        .slice(0, DEAL_MOVEMENT_CHANGES_SHOWN)
        .map(dealMovementChangeView);
    return { shown, more: Math.max(0, snapshot.changesTotal - shown.length) };
}

/** «и ещё N»; ничего не осталось — null. */
export const dealMovementMoreText = (more: number): string | null =>
    more > 0 ? `и ещё ${more}` : null;

/** Прогон не закончен и обновлялся недавно — ещё идёт. */
export function isDealMovementRunning(
    run: DealMovementRunStatus | null | undefined,
    now: Date,
): boolean {
    if (!run || run.finished) return false;
    const at = Date.parse(run.updatedAt);
    return (
        Number.isFinite(at) &&
        now.getTime() - at < DEAL_MOVEMENT_RUNNING_WINDOW_MS
    );
}

/** Состояние прогона словами: идёт (фаза), закончен, не удался, оборван. */
export function dealMovementPhaseText(
    run: DealMovementRunStatus,
    now: Date,
): string {
    if (run.phase === 'failed') {
        return `Не удался: ${run.error ?? 'причина не указана'}`;
    }
    if (run.finished) return 'Закончен';
    return isDealMovementRunning(run, now)
        ? `Идёт: ${DEAL_MOVEMENT_PHASE_TITLE[run.phase]}`
        : 'Оборвался без итога — запустите ещё раз';
}

/** Заголовок прогона: режим, кто поставил и когда начат. */
export function dealMovementRunHeadline(run: DealMovementRunStatus): string {
    const requester = DEAL_MOVEMENT_REQUESTER_TITLE[run.requestedBy];
    return [
        DEAL_MOVEMENT_MODE_TITLE[run.mode],
        requester,
        dealMovementMomentLabel(run.startedAt),
    ]
        .filter((part): part is string => Boolean(part))
        .join(', ');
}

/**
 * Ждём прогон, начатый отсюда: закончится, когда появится законченный
 * прогон, обновлённый позже нажатия (в момент нажатия запоминается
 * `updatedAt` прошлого прогона).
 */
export function isAwaitedDealMovementDone(
    run: DealMovementRunStatus | null | undefined,
    updatedAtBeforePress: string | null,
): boolean {
    return (
        !!run &&
        run.finished &&
        run.updatedAt !== updatedAtBeforePress
    );
}

/** Ответ постановки прогона → итог нажатия. */
export function dealMovementOutcome(
    result: DealMovementRunResult,
): LaunchOutcome {
    if (!result.dispatched) {
        return {
            ok: false,
            text: `Не запущено: ${result.reason ?? 'причина не указана'}`,
            raw: result,
        };
    }
    return result.dryRun
        ? {
              ok: true,
              text: 'Подсчёт поставлен в очередь. Итог появится в строке «Последний прогон» через несколько минут.',
              raw: result,
          }
        : {
              ok: true,
              text: 'Счёт поставлен в очередь. Итог сохранится и появится в этой карточке через несколько минут.',
              next: 'Сегодняшней ночью этот портал повторно не считается.',
              raw: result,
          };
}
