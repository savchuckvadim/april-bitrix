'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    MAX_RELATION_BARS,
    type RelationsBarNotice,
} from '../relations-bar';
import { useRelationsBar } from './use-relations-bar';

export interface RelationsNotice {
    notice: RelationsBarNotice | null;
    /** Данные связей загружены — notice окончательный, а не «ещё не знаем». */
    isReady: boolean;
}

/**
 * Хинт о выборе главной сделки для шапки (EntityBar): автопереключение на
 * свою открытую / чужая открытая без переключения.
 *
 * Отдельный хук, а не поле пропсов RelationsBar: предупреждение живёт у
 * НАЗВАНИЯ сущности (EntityWarningsFloat), а не в строке воронки. Данные —
 * тот же buildRelationsBar (мемоизирован), лишнего запроса нет; режим
 * 'deals' — notice считается только по сделкам, заявки на него не влияют.
 */
export const useRelationsNotice = (): RelationsNotice => {
    const view = useRelationsBar(MAX_RELATION_BARS, 'deals');
    const status = useAppSelector(s => s.relatedCrm.status);
    return { notice: view.notice, isReady: status === 'ready' };
};
