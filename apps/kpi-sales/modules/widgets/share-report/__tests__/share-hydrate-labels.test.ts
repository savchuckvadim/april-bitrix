import { describe, expect, it } from 'vitest';
import type { ShareLinkPublicResponseDto } from '@workspace/nest-kpi-report-sales-api';
import type { AppDispatch } from '@/modules/app/model/store';
import { portalViewActions } from '@/modules/feature/portal-view/model/portal-view-slice';
import { hydrateFromShareSnapshot } from '../model/share-report-thunks';

/*
 * /share: свои названия показателей портала приходят в ответе ссылки
 * (view.labels, поля нет в сгенерированном типе) и кладутся в настройки
 * вида — их читает useIndicatorLabeler, как во фрейме.
 */

const payloadWith = (extra: Record<string, unknown>): ShareLinkPublicResponseDto =>
    ({
        ui: { v: 1 },
        report: [],
        callings: [],
        finance: null,
        airtime: null,
        ...extra,
    }) as unknown as ShareLinkPublicResponseDto;

const hydrate = (payload: ShareLinkPublicResponseDto, dataOnly = false): unknown[] => {
    const actions: unknown[] = [];
    const dispatch = ((action: unknown) => {
        actions.push(action);
        return action;
    }) as unknown as AppDispatch;
    hydrateFromShareSnapshot(payload, { dataOnly })(dispatch);
    return actions;
};

describe('hydrateFromShareSnapshot — свои названия показателей', () => {
    const labels = { 'ev:presentation_plan': 'Назначенная презентация', 'call:30': 'Дозвоны' };

    it('названия из ответа ссылки попадают в стор', () => {
        expect(hydrate(payloadWith({ view: { labels } }))).toContainEqual(
            portalViewActions.publicLabelsApplied(labels),
        );
    });

    it('поллинг (dataOnly) тоже обновляет названия', () => {
        expect(hydrate(payloadWith({ view: { labels } }), true)).toContainEqual(
            portalViewActions.publicLabelsApplied(labels),
        );
    });

    it('старый бэк без view — своих названий нет', () => {
        expect(hydrate(payloadWith({}))).toContainEqual(
            portalViewActions.publicLabelsApplied({}),
        );
    });

    it('мусор в названиях отбрасывается', () => {
        expect(
            hydrate(payloadWith({ view: { labels: { 'ev:a': 'A', 'ev:b': 5, 'ev:c': ' ' } } })),
        ).toContainEqual(portalViewActions.publicLabelsApplied({ 'ev:a': 'A' }));
    });
});
