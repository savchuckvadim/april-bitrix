import { describe, expect, it } from 'vitest';
import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import {
    resolveDownloadAvailability,
    type DownloadSourceState,
} from '../download-availability.util';

const LOADED: DownloadSourceState = { isLoading: false, isFetched: true };
const LOADING: DownloadSourceState = { isLoading: true, isFetched: false };
const NEVER: DownloadSourceState = { isLoading: false, isFetched: false };
/** Данные есть, но идёт перезапрос по новому фильтру. */
const RELOADING: DownloadSourceState = { isLoading: true, isFetched: true };

const REPORT_TABS = [
    EReportType.All,
    EReportType.EVENTS,
    EReportType.CALLINGS,
    EReportType.MERGED,
];

describe('resolveDownloadAvailability', () => {
    it.each(REPORT_TABS)(
        'вкладка отчёта %s: оба источника загружены — кнопка активна',
        type => {
            expect(
                resolveDownloadAvailability(type, {
                    events: LOADED,
                    callings: LOADED,
                }),
            ).toEqual({ visible: true, ready: true });
        },
    );

    it.each([
        ['события считаются', LOADING, LOADED],
        ['звонки считаются', LOADED, LOADING],
        ['события ещё не запрашивались', NEVER, LOADED],
        ['звонки ещё не запрашивались', LOADED, NEVER],
        ['события перезапрашиваются', RELOADING, LOADED],
    ])(
        'вкладка отчёта: %s — кнопка видна, но неактивна',
        (_name, events, callings) => {
            expect(
                resolveDownloadAvailability(EReportType.All, {
                    events,
                    callings,
                }),
            ).toEqual({ visible: true, ready: false });
        },
    );

    it.each([EReportType.DIGEST, EReportType.AI])(
        'вкладка %s: выгрузки нет — кнопка скрыта',
        type => {
            expect(
                resolveDownloadAvailability(type, {
                    events: LOADED,
                    callings: LOADED,
                }),
            ).toEqual({ visible: false, ready: false });
        },
    );

    it('«Финансы»: свои листы — кнопка активна без событий и звонков', () => {
        expect(
            resolveDownloadAvailability(EReportType.FINANCE, {
                events: NEVER,
                callings: NEVER,
            }),
        ).toEqual({ visible: true, ready: true });
    });
});
