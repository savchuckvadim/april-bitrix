import { describe, expect, it } from 'vitest';
import {
    INTERACTIVE_REQUEST_TIMEOUT_MS,
    resolveRequestTimeout,
} from './request-timeout';

describe('таймаут интерактивных запросов', () => {
    it.each([
        ['POST', '/api/duplicates/details'],
        ['POST', '/api/duplicates/search'],
        ['POST', '/api/sales-hooks/client-work/deals'],
        ['POST', '/api/event-sales/stage-predict'],
        ['POST', '/api/bitrix/department/sales'],
        ['POST', '/api/bx/department/structure'],
        ['GET', '/api/inn/deal/31077'],
        ['GET', '/api/lead-request/card/325519?domain=a.bitrix24.ru'],
        ['GET', '/api/app-settings/event-sales'],
        ['GET', '/api/questionnaires'],
        ['GET', '/api/questionnaires/version'],
    ])('чтение %s %s — с потолком ожидания', (method, url) => {
        expect(resolveRequestTimeout({ url, method })).toBe(
            INTERACTIVE_REQUEST_TIMEOUT_MS,
        );
    });

    it.each([
        // Отчёт ведёт очередь досылки — у неё свои сроки.
        ['POST', '/api/event-sales/flow'],
        ['POST', '/api/event-sales/flow/deferred'],
        // Записи: обрыв не отменяет действие на сервере.
        ['POST', '/api/sales-hooks/client-work/join'],
        ['POST', '/api/inn/deal/31077/choose'],
        ['POST', '/api/inn/deal/31077/hide'],
        ['POST', '/api/lead-request/update'],
        ['POST', '/api/lead-request/accept'],
        ['POST', '/api/merge-deals/merge'],
        // Долгое чтение записей звонков — без потолка.
        ['POST', '/api/event-sales-bx-records/company'],
    ])('%s %s — без таймаута', (method, url) => {
        expect(resolveRequestTimeout({ url, method })).toBeUndefined();
    });

    it('метод без регистра и без указания считается чтением GET', () => {
        expect(
            resolveRequestTimeout({ url: '/api/inn/deal/5', method: 'get' }),
        ).toBe(INTERACTIVE_REQUEST_TIMEOUT_MS);
        expect(resolveRequestTimeout({ url: '/api/inn/deal/5' })).toBe(
            INTERACTIVE_REQUEST_TIMEOUT_MS,
        );
    });

    it('нет адреса — правила нет', () => {
        expect(resolveRequestTimeout({})).toBeUndefined();
    });
});
