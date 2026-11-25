import { beforeEach, describe, expect, it } from 'vitest';
import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import { getReportDataNeeds } from '../../lib/report-data-needs.util';
import {
    activeReportDataNeeds,
    addReportDataDemand,
    resetReportDataDemands,
} from '../report-data-demand';

/*
 * Заявки на данные вне вкладки: страница сотрудника читает командный отчёт
 * по событиям, с какой бы вкладки на неё ни пришли.
 */

beforeEach(() => {
    resetReportDataDemands();
});

describe('activeReportDataNeeds', () => {
    it('без заявок — ровно нужды вкладки', () => {
        for (const type of Object.values(EReportType)) {
            expect(activeReportDataNeeds(type)).toEqual(
                getReportDataNeeds(type),
            );
        }
    });

    it('заявка на события: вкладке без нужд нужны события, звонки — нет', () => {
        addReportDataDemand('report');
        expect(activeReportDataNeeds(EReportType.AI)).toEqual({
            events: true,
            callings: false,
            blocking: null,
        });
    });

    it('заявка на звонки: вкладке без нужд нужны звонки, события — нет', () => {
        addReportDataDemand('calling');
        expect(activeReportDataNeeds(EReportType.DIGEST)).toEqual({
            events: false,
            callings: true,
            blocking: null,
        });
    });

    it('заявка не меняет то, что блокирует страницу', () => {
        addReportDataDemand('report');
        expect(activeReportDataNeeds(EReportType.CALLINGS).blocking).toBe(
            'calling',
        );
        expect(activeReportDataNeeds(EReportType.FINANCE).blocking).toBeNull();
    });
});

describe('addReportDataDemand', () => {
    it('снятие заявки возвращает нужды вкладки', () => {
        const release = addReportDataDemand('report');
        release();
        expect(activeReportDataNeeds(EReportType.AI).events).toBe(false);
    });

    it('заявителей несколько: источник нужен, пока жив хотя бы один', () => {
        const releaseFirst = addReportDataDemand('report');
        const releaseSecond = addReportDataDemand('report');
        releaseFirst();
        expect(activeReportDataNeeds(EReportType.AI).events).toBe(true);
        releaseSecond();
        expect(activeReportDataNeeds(EReportType.AI).events).toBe(false);
    });

    it('повторное снятие одной заявки чужую не снимает', () => {
        const releaseFirst = addReportDataDemand('report');
        addReportDataDemand('report');
        releaseFirst();
        releaseFirst();
        expect(activeReportDataNeeds(EReportType.AI).events).toBe(true);
    });
});
