import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { withClientType, type ClientTypeItemCode } from '../../../document-payload/lib/__fixtures__/root-state';
import { buildWordPreviewRequest } from '../../../offer-template-word/lib/build-word-preview-request';
import { recordOf, variantItems } from '../__fixtures__/variant-records';
import { rootStateWithVariants, rootStateWithVariantsAndTemplate } from '../__fixtures__/variants-state';
import {
    buildOfferGenerateRequest,
    buildOfferMultiGenerateRequest,
    offerBlocker,
    offerGenerateBlocker,
    offerRequestBlocker,
    offerWordGenerateBlocker,
} from '../build-offer-request';
import { CLIENT_TYPE_REQUIRED_BLOCKER, clientTypeBlocker, toOfferClientType } from '../client-type.util';
import { RQ_TYPE } from '../../../bx-rq/model/types';

const wordState = (clientType: ClientTypeItemCode | null): RootState =>
    withClientType(rootStateWithVariantsAndTemplate([recordOf(1, 102, 'buh')], variantItems), clientType);

const pdfState = (clientType: ClientTypeItemCode | null): RootState =>
    withClientType(rootStateWithVariants([recordOf(1, 102, 'buh')], variantItems), clientType);

describe('тип клиента обязателен для формирования КП', () => {
    it('текст блокера', () => {
        expect(CLIENT_TYPE_REQUIRED_BLOCKER).toBe(
            'Укажите тип клиента в шапке: коммерческие, бюджетники, ИП, физ. лицо или адвокаты',
        );
    });

    it('чистая проверка: тип не задан — блокер, задан — нет', () => {
        expect(clientTypeBlocker(null)).toBe(CLIENT_TYPE_REQUIRED_BLOCKER);
        expect(clientTypeBlocker(undefined)).toBe(CLIENT_TYPE_REQUIRED_BLOCKER);
        expect(clientTypeBlocker(RQ_TYPE.IP)).toBeNull();
    });

    it('Word: тип не задан — формирование заблокировано', () => {
        const state = wordState(null);
        expect(offerGenerateBlocker(state, 'word')).toBe(CLIENT_TYPE_REQUIRED_BLOCKER);
        expect(offerWordGenerateBlocker(state)).toBe(CLIENT_TYPE_REQUIRED_BLOCKER);
    });

    it('PDF: тип не задан — формирование заблокировано тем же текстом', () => {
        expect(offerGenerateBlocker(pdfState(null), 'pdf')).toBe(CLIENT_TYPE_REQUIRED_BLOCKER);
        expect(offerGenerateBlocker(pdfState(null), 'pdf')).toBe(offerGenerateBlocker(wordState(null), 'word'));
    });

    it.each<ClientTypeItemCode>(['commerc', 'state', 'ip', 'fiz', 'layer'])(
        'тип «%s» задан — блокера нет ни у Word, ни у PDF',
        code => {
            expect(offerGenerateBlocker(wordState(code), 'word')).toBeNull();
            expect(offerGenerateBlocker(pdfState(code), 'pdf')).toBeNull();
        },
    );

    it('остальные блокеры идут первыми: без шаблона Word скажет про шаблон', () => {
        const state = withClientType(rootStateWithVariants([recordOf(1, 102, 'buh')], variantItems), null);
        expect(offerGenerateBlocker(state, 'word')).toBe('Выберите шаблон КП');
    });
});

describe('превью типом клиента не блокируется', () => {
    it('блокеры превью и сборки запроса не знают про тип клиента', () => {
        expect(offerRequestBlocker(wordState(null))).toBeNull();
        expect(offerBlocker(pdfState(null), 'pdf')).toBeNull();
    });

    it('тело превью и запрос формирования собираются и без типа клиента (как для организации)', () => {
        const state = wordState(null);
        expect(buildWordPreviewRequest(state)?.clientType).toBe('org');
        expect(buildOfferGenerateRequest(state)?.clientType).toBe('org');
    });
});

describe('clientType в запросе КП в Word берётся из типа клиента', () => {
    it.each<[ClientTypeItemCode, string]>([
        ['commerc', 'org'],
        ['state', 'org_state'],
        ['ip', 'ip'],
        ['fiz', 'fiz'],
        // адвокаты уходят как физлицо: у них пока нет своего пресета реквизитов
        ['layer', 'fiz'],
    ])('пункт «%s» → clientType «%s»', (code, expected) => {
        const state = wordState(code);
        expect(buildOfferGenerateRequest(state)?.clientType).toBe(expected);
        expect(buildOfferMultiGenerateRequest(state)?.clientType).toBe(expected);
        expect(buildWordPreviewRequest(state)?.clientType).toBe(expected);
    });

    it('сопоставление типов реквизитов с типом в запросе', () => {
        expect(toOfferClientType(RQ_TYPE.ORGANIZATION)).toBe('org');
        expect(toOfferClientType(RQ_TYPE.BUDGET)).toBe('org_state');
        expect(toOfferClientType(RQ_TYPE.IP)).toBe('ip');
        expect(toOfferClientType(RQ_TYPE.FIZ)).toBe('fiz');
    });
});
