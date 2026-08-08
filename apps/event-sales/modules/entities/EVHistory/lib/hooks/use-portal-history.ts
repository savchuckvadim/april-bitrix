'use client';

import { useMemo } from 'react';
import { readFieldValue } from '@workspace/pbx';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';

/**
 * История работы по клиенту из портальных полей сущности.
 *
 * Почему не из эндпоинта: `event-support/history` на бэке — заглушка
 * (`EventSupportStubService` возвращает пустой массив). А те же данные уже
 * лежат в самой сущности Битрикса в PBX-полях `op_history` (текущая история)
 * и `op_mhistory` (накопленные комментарии). Читаем их по кодам через Portal —
 * ровно так, как описано в docs/pbx-fields-system.md. Когда эндпоинт допишут,
 * поменяется только этот хук.
 */

/** Код поля с текущей историей работы. */
const HISTORY_FIELD_CODE = 'op_history';
/** Код множественного поля с комментариями. */
const HISTORY_COMMENTS_FIELD_CODE = 'op_mhistory';

export interface PortalHistory {
    /** Последняя запись — она же то, что видно без раскрытия. */
    latest: string;
    /** Все записи, свежие сверху. */
    items: string[];
    /** Полей нет на портале — блок истории показывать нечего. */
    isAvailable: boolean;
}

const toLines = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.map(item => String(item ?? '').trim()).filter(Boolean);
    }
    if (typeof value === 'string') {
        return value
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);
    }
    return [];
};

export const usePortalHistory = (): PortalHistory => {
    const portal = useAppSelector(s => s.portal.portal);
    const company = useAppSelector(s => s.app.bitrix.company);
    const deal = useAppSelector(s => s.app.bitrix.deal);
    const lead = useAppSelector(s => s.app.bitrix.lead);

    return useMemo(() => {
        // Приоритет как у контекста: компания → сделка → лид. Сделка без
        // компании раньше выпадала вовсе, хотя бэк пишет историю отчётов
        // именно в поля сделки-владельца.
        const entity = (company ?? deal ?? lead) as unknown as Record<
            string,
            unknown
        > | null;
        const fields = company
            ? portal?.company?.bitrixfields
            : deal
              ? portal?.bitrixDeal?.bitrixfields
              : portal?.lead?.bitrixfields;

        const current = toLines(
            readFieldValue(fields, entity, HISTORY_FIELD_CODE),
        );
        const comments = toLines(
            readFieldValue(fields, entity, HISTORY_COMMENTS_FIELD_CODE),
        );

        // Комментарии копятся снизу вверх — переворачиваем, чтобы свежее было
        // первым: менеджеру нужна последняя запись, а не первая за всю историю.
        const items = [...current, ...comments.slice().reverse()];

        return {
            latest: items[0] ?? '',
            items,
            isAvailable: !!fields?.length,
        };
    }, [portal, company, lead]);
};
