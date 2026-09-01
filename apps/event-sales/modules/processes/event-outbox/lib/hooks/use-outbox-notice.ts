'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    FLOW_OUTBOX_STATE,
    FLOW_STAGE,
} from '@/modules/processes/event/model/FlowStatusSlice';

import {
    OUTBOX_NOTICE_COVERED,
    resolveOutboxNotice,
    type OutboxNotice,
    type OutboxNoticeCovered,
} from '../outbox-notice';

/**
 * Что о ТЕКУЩЕЙ отправке уже сказал баннер стадии прямо над полоской.
 *
 * Её конверт лежит в тех же счётчиках зеркала, и без этого две строки
 * подряд говорили бы об одном отчёте: «Отчёт ещё отправляется» и следом
 * «1 отчёт ждёт отправки». Полоска — про ОСТАЛЬНЫЕ конверты, поэтому
 * текущий из счёта вычитается (см. withoutCovered).
 */
const resolveCovered = (
    stage: FLOW_STAGE,
    outboxState: FLOW_OUTBOX_STATE,
): OutboxNoticeCovered => {
    if (
        stage === FLOW_STAGE.SENDING &&
        (outboxState === FLOW_OUTBOX_STATE.NONE ||
            outboxState === FLOW_OUTBOX_STATE.QUEUED)
    ) {
        // «Отчёт ещё отправляется» либо «сохранён — отправится автоматически»:
        // конверт числится недоставленным, о нём уже сказано.
        return OUTBOX_NOTICE_COVERED.WAITING;
    }
    if (stage === FLOW_STAGE.DONE) {
        if (outboxState === FLOW_OUTBOX_STATE.PARTIAL) {
            return OUTBOX_NOTICE_COVERED.TAIL;
        }
        if (outboxState === FLOW_OUTBOX_STATE.INCOMPLETE) {
            return OUTBOX_NOTICE_COVERED.INCOMPLETE;
        }
    }

    return OUTBOX_NOTICE_COVERED.NONE;
};

/**
 * Состояние полоски недоставленных отчётов; null — показывать нечего.
 *
 * Всё читается из зеркала OutboxSlice (его наполняют thunk'и outbox по
 * хранилищу) — компонент в IndexedDB не ходит и ничего не пересчитывает.
 * Чужой домен в счётчике — страховка от смешения порталов: молчим, пока
 * дренаж не пересчитает.
 */
export const useOutboxNotice = (): OutboxNotice | null => {
    const count = useAppSelector(s => s.outbox.undeliveredCount);
    const partialCount = useAppSelector(s => s.outbox.partialCount);
    const incompleteCount = useAppSelector(s => s.outbox.incompleteCount);
    const draining = useAppSelector(s => s.outbox.draining);
    const countedDomain = useAppSelector(s => s.outbox.countedDomain);
    const domain = useAppSelector(s => s.app.domain);
    const stage = useAppSelector(s => s.flowStatus.stage);
    const outboxState = useAppSelector(s => s.flowStatus.outboxState);

    if (countedDomain && domain && countedDomain !== domain) {
        return null;
    }

    return resolveOutboxNotice({
        count,
        partialCount,
        incompleteCount,
        draining,
        covered: resolveCovered(stage, outboxState),
    });
};
