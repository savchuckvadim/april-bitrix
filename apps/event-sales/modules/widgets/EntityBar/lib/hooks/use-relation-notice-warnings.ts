'use client';

import { useMemo, useRef } from 'react';
import {
    useCurrentRelations,
    useRelationsNotice,
    type RelationsBarNotice,
} from '@/modules/entities/RelatedCrm';
import { relationNoticeToWarning } from '../entity-warning-view';
import type { EntityWarning } from './use-entity-warnings';

/**
 * Хинты о выборе главной сделки — пилюлями всплывашки у названия
 * (EntityWarningsFloat): «работа продолжается в открытой „…“» (инфо) и
 * «у клиента открытая сделка менеджера …» (warning).
 *
 * Ref-защёлка на сессию клиента (требование владельца: показать один раз, не
 * мигать): всплывашка сама всплывает на СМЕНУ набора id (use-warning-hint),
 * поэтому пропадание хинта на время перезагрузки связей (reload сбрасывает
 * relatedCrm) заставляло бы её всплывать заново на каждый ⟳. Пока данные не
 * готовы, отдаём последний вычисленный хинт клиента — набор id стабилен,
 * автопоказ случается один раз; маркер-иконка с хинтом остаётся всегда.
 */
export const useRelationNoticeWarnings = (): EntityWarning[] => {
    const { descriptor } = useCurrentRelations();
    const { notice, isReady } = useRelationsNotice();

    const clientKey = descriptor
        ? `${descriptor.entityType}:${descriptor.entityId}`
        : null;
    const latchRef = useRef<{
        clientKey: string | null;
        notice: RelationsBarNotice | null;
    }>({ clientKey: null, notice: null });

    return useMemo(() => {
        // Новый клиент — прошлая защёлка не про него.
        if (latchRef.current.clientKey !== clientKey) {
            latchRef.current = { clientKey, notice: null };
        }
        if (notice) {
            latchRef.current.notice = notice;
        } else if (isReady) {
            // Связи загружены и хинта нет — условие честно ушло (закрыли
            // чужую сделку, сменили ответственного): гасим и защёлку.
            latchRef.current.notice = null;
        }
        const effective = notice ?? latchRef.current.notice;
        return effective ? [relationNoticeToWarning(effective)] : [];
    }, [clientKey, notice, isReady]);
};
