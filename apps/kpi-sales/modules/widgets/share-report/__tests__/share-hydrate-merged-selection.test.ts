import { describe, expect, it } from 'vitest';
import type { ShareLinkPublicResponseDto } from '@workspace/nest-kpi-report-sales-api';
import type { AppDispatch } from '@/modules/app/model/store';
import { mergedReportActions } from '@/modules/feature/merged-kpi-calling-report/model/MergedReportSlice';
import { hydrateFromShareSnapshot } from '../model/share-report-thunks';

/*
 * /share: снимки, созданные до перехода на один фильтр, несут выбор
 * сотрудников объединённого отчёта (mergedSelection.selectedUsers).
 * Публичная страница показывает их, как раньше; формат снимка не менялся.
 */

const payloadWith = (
    mergedSelection: { selectedUsers?: number[]; selectedActions?: string[] },
): ShareLinkPublicResponseDto =>
    ({
        ui: { v: 1, mergedSelection },
        report: [],
        callings: [],
        finance: null,
        airtime: null,
    }) as unknown as ShareLinkPublicResponseDto;

/** Действия, которые публичная страница шлёт в стор при гидратации. */
const hydrate = (
    payload: ShareLinkPublicResponseDto,
    dataOnly = false,
): unknown[] => {
    const actions: unknown[] = [];
    const dispatch = ((action: unknown) => {
        actions.push(action);
        return action;
    }) as unknown as AppDispatch;
    hydrateFromShareSnapshot(payload, { dataOnly })(dispatch);
    return actions;
};

describe('hydrateFromShareSnapshot — выбор объединённого отчёта', () => {
    it('старый снимок: выбранные сотрудники и показатели попадают в стор', () => {
        const actions = hydrate(
            payloadWith({
                selectedUsers: [11, 12],
                selectedActions: ['Звонки', 'Встречи'],
            }),
        );

        expect(actions).toContainEqual(
            mergedReportActions.setSelectedUsers([11, 12]),
        );
        expect(actions).toContainEqual(
            mergedReportActions.setSelectedActions(['Звонки', 'Встречи']),
        );
    });

    it('новый снимок (сотрудников нет, показатели «все»): выбор пуст', () => {
        const actions = hydrate(
            payloadWith({ selectedUsers: [], selectedActions: [] }),
        );

        expect(actions).toContainEqual(mergedReportActions.setSelectedUsers([]));
        expect(actions).toContainEqual(
            mergedReportActions.setSelectedActions([]),
        );
    });

    it('снимок без полей выбора — пустой выбор («без ограничения»)', () => {
        const actions = hydrate(payloadWith({}));

        expect(actions).toContainEqual(mergedReportActions.setSelectedUsers([]));
        expect(actions).toContainEqual(
            mergedReportActions.setSelectedActions([]),
        );
    });

    it('тихое обновление (поллинг): выбор зрителя не перетирается', () => {
        const actions = hydrate(
            payloadWith({ selectedUsers: [11], selectedActions: ['Звонки'] }),
            true,
        );

        expect(actions).not.toContainEqual(
            mergedReportActions.setSelectedUsers([11]),
        );
        expect(actions).not.toContainEqual(
            mergedReportActions.setSelectedActions(['Звонки']),
        );
    });
});
