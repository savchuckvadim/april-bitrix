import { describe, expect, it } from 'vitest';
import { getReloadResetActions } from './reload-reset';
import {
    duplicatesActions,
    duplicatesReducer,
} from '@/modules/features/Duplicates/model/DuplicatesSlice';
import {
    eventContactActions,
    eventContactReducer,
} from '@/modules/entities/EventContact/model/EventContactSlice';
import {
    planScheduleActions,
    planScheduleReducer,
} from '@/modules/entities/EventPlan/model/PlanScheduleSlice';
import {
    afterPresentationActions,
    afterPresentationReducer,
} from '@/modules/features/AfterPresentation/model/AfterPresentationSlice';
import {
    eventHistoryActions,
    eventHistoryReducer,
} from '@/modules/entities/EVHistory/model/EVHistorySlice';
import {
    eventCallingRecordActions,
    eventCallingRecordReducer,
} from '@/modules/entities/EventCallingRecord/model/EventCallingRecordSlice';
import {
    eventLeadActions,
    eventLeadReducer,
} from '@/modules/entities/EVLid/model/EVLeadSlice';
import {
    xvostFieldsActions,
    xvostFieldsReducer,
} from '@/modules/features/XvostFields/model/XvostFieldsSlice';
import type { BXLead } from '@workspace/bx';

/** Слайсы, которые обязан сбрасывать reload (префиксы action type). */
const EXPECTED_RESET_SLICES = [
    'taskDeals',
    'relatedCrm',
    'bitrixUser',
    'purchaseSignals',
    'callChecklist',
    'stagePredict',
    'leadMarks',
    'inn',
    'clientSignals',
    'leadRequest',
    'presentationLeadLink',
    'taskLeadLinks',
    'duplicates',
    'afterPresentation',
    'xvostFields',
    'eventContactSlice',
    'eventHistory',
    'eventCallingRecord',
    'eventLead',
    'planSchedule',
];

const initialOf = <S>(reducer: (state: S | undefined, action: never) => S): S =>
    reducer(undefined, { type: '@@INIT' } as never);

describe('getReloadResetActions', () => {
    it('покрывает все кэширующие слайсы и ничего лишнего', () => {
        const prefixes = getReloadResetActions().map(
            action => String(action.type).split('/')[0],
        );
        expect(prefixes.sort()).toEqual([...EXPECTED_RESET_SLICES].sort());
        // По одному сбросу на слайс — дубль значит случайный второй экшен.
        expect(new Set(prefixes).size).toBe(prefixes.length);
    });
});

describe('reset-редьюсеры reload-каталога', () => {
    it('duplicates: сброс возвращает слайс к initialState', () => {
        const dirty = duplicatesReducer(
            undefined,
            duplicatesActions.searchStarted({ isAuto: true }),
        );
        expect(dirty.status).toBe('loading');
        expect(duplicatesReducer(dirty, duplicatesActions.reset())).toEqual(
            initialOf(duplicatesReducer),
        );
    });

    it('contact: сброс чистит и список, и открытые окна', () => {
        const withDialog = eventContactReducer(
            undefined,
            eventContactActions.openContactDialog({ mode: 'view' }),
        );
        const dirty = eventContactReducer(
            withDialog,
            eventContactActions.setFetchedContacts({
                contacts: [{ ID: 7 }] as never,
                sources: { 7: ['company'] } as never,
            }),
        );
        expect(dirty.contacts).toHaveLength(1);
        expect(dirty.dialog).not.toBeNull();
        expect(eventContactReducer(dirty, eventContactActions.reset())).toEqual(
            initialOf(eventContactReducer),
        );
    });

    it('planSchedule: сброс гасит кэш по дате', () => {
        const dirty = planScheduleReducer(
            undefined,
            planScheduleActions.setFetched({
                date: '2026-08-25',
                items: [{ time: '10:00', title: 'Звонок', type: 'call' }],
            }),
        );
        expect(dirty.date).toBe('2026-08-25');
        expect(planScheduleReducer(dirty, planScheduleActions.reset())).toEqual(
            initialOf(planScheduleReducer),
        );
    });

    it('afterPresentation: сброс гасит и initialized (в отличие от resetForNewEvent)', () => {
        const initializedState = afterPresentationReducer(
            undefined,
            afterPresentationActions.setInitialized({ items: [] }),
        );
        const dirty = afterPresentationReducer(
            initializedState,
            afterPresentationActions.setAnswer({ id: 'op_5k_1', value: 'да' }),
        );

        const afterNewEvent = afterPresentationReducer(
            dirty,
            afterPresentationActions.resetForNewEvent(),
        );
        expect(afterNewEvent.initialized).toBe(true);

        expect(
            afterPresentationReducer(dirty, afterPresentationActions.reset()),
        ).toEqual(initialOf(afterPresentationReducer));
    });

    it('xvostFields: сброс гасит оверрайды — свежая строка CRM главнее', () => {
        const dirty = xvostFieldsReducer(
            undefined,
            xvostFieldsActions.setValue({
                dealId: 5,
                code: 'op_xvost_is_offer',
                value: 'Y',
            }),
        );
        expect(Object.keys(dirty.valueByKey)).toHaveLength(1);
        expect(xvostFieldsReducer(dirty, xvostFieldsActions.reset())).toEqual(
            initialOf(xvostFieldsReducer),
        );
    });

    it('eventHistory: сброс возвращает ленивую секцию в idle', () => {
        const dirty = eventHistoryReducer(
            undefined,
            eventHistoryActions.setLoading(),
        );
        expect(dirty.status).toBe('loading');
        expect(eventHistoryReducer(dirty, eventHistoryActions.reset())).toEqual(
            initialOf(eventHistoryReducer),
        );
    });

    it('eventCallingRecord: clean гасит isFetched ленивой секции', () => {
        const dirty = eventCallingRecordReducer(
            undefined,
            eventCallingRecordActions.setFiles({
                records: [{ id: 1, isPlaying: false }] as never,
            }),
        );
        expect(dirty.isFetched).toBe(true);
        expect(
            eventCallingRecordReducer(dirty, eventCallingRecordActions.clean()),
        ).toEqual(initialOf(eventCallingRecordReducer));
    });

    it('eventLead: clean снимает лид, не трогая справочник статусов', () => {
        const dirty = eventLeadReducer(
            undefined,
            eventLeadActions.setCurrentLead({
                lead: { ID: 5 } as unknown as BXLead,
            }),
        );
        expect(dirty.lead).not.toBeNull();
        const cleaned = eventLeadReducer(dirty, eventLeadActions.clean());
        expect(cleaned.lead).toBeNull();
        expect(cleaned.status.items.length).toBeGreaterThan(0);
    });
});
