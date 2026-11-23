import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { COMPLECT_MODE, type ComplectMode } from '../../../complect-variant/model/dto';
import {
    comparisonRowOf,
    compositionOf,
    syncedAlternative,
} from '../../../document-payload/lib/__fixtures__/two-garant-set';
import { hasAlternativeComplects } from '../../../document-payload';
import { recordOf, snapshotRowsOf, variantItems } from '../../../offer-document/lib/__fixtures__/variant-records';
import { oneGarantGeneral, rootStateWithVariants } from '../../../offer-document/lib/__fixtures__/variants-state';
import type { RowSet } from '../../../row-set';
import { restoreV2, serializeV2 } from '../../../snapshot/lib/v2/serialize';
import { offerPdfActions, offerPdfReducer } from '../../model/OfferPdfSlice';
import { OFFER_PDF_DEFAULT_SETTINGS, type OfferPdfSettings, type OfferPdfState } from '../../model/types';
import { ALTERNATIVE_COMPLECTS_FIELD } from '../offer-pdf-alternative-complects';
import { buildOfferPdfGenerateRequest, type OfferPdfRequestOptions } from '../build-offer-pdf-request';
import { offerPdfRequestKey } from '../offer-pdf-request-key';
import { mergeOfferPdfSnapshot, offerPdfForLibrary, offerPdfForSnapshot, offerPdfStyleOf } from '../offer-pdf-snapshot.util';
import { normalizeOfferPdfPrefs, normalizeOfferPdfStyle } from '../offer-pdf-storage';

/**
 * Настройка «Наполнение наборов для сравнения»: хранится и запоминается вместе
 * с остальными настройками PDF, входит в запрос и в ключ превью.
 */

const initial: OfferPdfState = offerPdfReducer(undefined, { type: '@@init' });
const run = (state: OfferPdfState, ...actions: Parameters<typeof offerPdfReducer>[1][]): OfferPdfState =>
    actions.reduce(offerPdfReducer, state);

const optionsOf = (alternativeComplects: boolean): OfferPdfRequestOptions => ({
    templateCode: 'classic',
    palette: null,
    settings: { ...OFFER_PDF_DEFAULT_SETTINGS, alternativeComplects },
    letter: { appeal: '', text: '' },
    documentNumber: '',
});

const requestOf = (state: RootState, alternativeComplects: boolean) => {
    const request = buildOfferPdfGenerateRequest(state, optionsOf(alternativeComplects));
    if (!request) throw new Error('PDF-запрос не собрался');
    return request;
};

const urComposition = compositionOf('ur', { infoblocks: ['rus', 'la', 'ntss'], lt: ['ltsut'], regions: ['spb'] });
const buhComposition = compositionOf('buh', { infoblocks: ['rus', 'reg', 'bbu'], lt: ['ltsut'], regions: ['stv'] });

/** Набор для сравнения из одного комплекта с наполнением */
const alternativeSet = (setId: string, complectCode: string, composition = urComposition): RowSet =>
    syncedAlternative(setId, [comparisonRowOf(`${setId}_row`, setId, complectCode, composition)]);

/** Набор для сравнения, у которого комплект без наполнения */
const bareAlternativeSet = (setId: string): RowSet =>
    syncedAlternative(setId, [comparisonRowOf(`${setId}_row`, setId, 'ur', undefined)]);

const withAlternative = (state: RootState, alternative: RowSet[]): RootState => ({
    ...state,
    rowSet: { ...state.rowSet, alternative },
});

/** Сделка без вариантов с двумя наборами для сравнения, у обоих есть наполнение */
const twoSetsState = (): RootState =>
    withAlternative(rootStateWithVariants([], variantItems), [
        alternativeSet('alt_1', 'buh', buhComposition),
        alternativeSet('alt_2', 'ur'),
    ]);

describe('PDF-запрос: наполнение наборов для сравнения на верхнем уровне', () => {
    it('настройка выключена — поля нет, даже когда у наборов есть наполнение', () => {
        const request = requestOf(twoSetsState(), false);
        expect(request).not.toHaveProperty('alternativeComplects');
    });

    it('настройка включена — поле есть: по записи на набор, номер и заголовок как в таблице цен', () => {
        const request = requestOf(twoSetsState(), true);
        expect(request.alternativeComplects?.map(item => [item.setNumber, item.title])).toEqual([
            [1, 'Набор 1'],
            [2, 'Набор 2'],
        ]);
        expect(request.alternativeComplects?.every(item => item.complects.length > 0)).toBe(true);
        // настройка — поле верхнего уровня, в settings бэка её нет
        expect(request.settings).not.toHaveProperty('alternativeComplects');
    });

    it('номера в поле совпадают со setId строк наборов в том же запросе', () => {
        const request = requestOf(twoSetsState(), true);
        const rowSetIds = new Set(request.rows.filter(row => row.type === 'alternative').map(row => row.setId));
        for (const item of request.alternativeComplects ?? []) expect(rowSetIds.has(item.setNumber)).toBe(true);
    });

    it('набор без наполнения в поле не попадает и номера других не сдвигает', () => {
        const state = withAlternative(rootStateWithVariants([], variantItems), [
            bareAlternativeSet('alt_1'),
            alternativeSet('alt_2', 'ur'),
        ]);
        const request = requestOf(state, true);
        expect(request.alternativeComplects?.map(item => item.setNumber)).toEqual([2]);
    });

    it('включено, но наборов с наполнением нет — поля нет', () => {
        const noSets = rootStateWithVariants([], variantItems);
        expect(requestOf(noSets, true)).not.toHaveProperty('alternativeComplects');
        const bare = withAlternative(noSets, [bareAlternativeSet('alt_1')]);
        expect(requestOf(bare, true)).not.toHaveProperty('alternativeComplects');
    });

    it('переключение меняет ключ превью, и превью пересобирается', () => {
        const state = twoSetsState();
        const off = offerPdfRequestKey(requestOf(state, false));
        const on = offerPdfRequestKey(requestOf(state, true));
        expect(on).not.toBe(off);
        expect(offerPdfRequestKey(requestOf(state, true))).toBe(on);
    });

    it('правка состава набора при включённой настройке меняет ключ превью', () => {
        const before = offerPdfRequestKey(requestOf(twoSetsState(), true));
        const edited = withAlternative(rootStateWithVariants([], variantItems), [
            alternativeSet('alt_1', 'buh', buhComposition),
            alternativeSet('alt_2', 'ur', { ...urComposition, infoblocks: ['rus'] }),
        ]);
        expect(offerPdfRequestKey(requestOf(edited, true))).not.toBe(before);
    });
});

describe('PDF-запрос: наполнение наборов для сравнения у открытого варианта', () => {
    const MODES: ComplectMode[] = [COMPLECT_MODE.compare, COMPLECT_MODE.single_contract, COMPLECT_MODE.multi_contract];
    // слепок открытого варианта устарел: наборов для сравнения в нём нет
    const staleRecords = () => [recordOf(1, 102, 'buh', snapshotRowsOf(oneGarantGeneral()))];
    const stateOf = (mode: ComplectMode): RootState =>
        withAlternative(
            rootStateWithVariants(staleRecords(), variantItems, oneGarantGeneral(), { mode, openVariantSmartId: 102 }),
            [alternativeSet('alt_1', 'buh', buhComposition), alternativeSet('alt_2', 'ur')],
        );

    it.each(MODES)('режим %s: включено — вариант несёт наполнение живых наборов, слепок не нужен', mode => {
        const request = requestOf(stateOf(mode), true);
        const [open] = request.variants ?? [];
        expect(request.variants?.map(variant => variant.variantSmartId)).toEqual([102]);
        expect(open?.alternativeComplects?.map(item => [item.setNumber, item.title])).toEqual([
            [1, 'Набор 1'],
            [2, 'Набор 2'],
        ]);
        // у участника и у самого КП наполнение одно и то же: оба собраны из живого состояния
        expect(open?.alternativeComplects).toEqual(request.alternativeComplects);
    });

    it.each(MODES)('режим %s: выключено — поля нет ни у КП, ни у варианта', mode => {
        const request = requestOf(stateOf(mode), false);
        expect(request).not.toHaveProperty('alternativeComplects');
        expect(request.variants?.[0]).not.toHaveProperty('alternativeComplects');
    });

    it('переключение меняет ключ превью и при открытом варианте', () => {
        const state = stateOf(COMPLECT_MODE.compare);
        expect(offerPdfRequestKey(requestOf(state, true))).not.toBe(offerPdfRequestKey(requestOf(state, false)));
    });
});

describe('видимость переключателя', () => {
    it('нет наборов для сравнения — переключателя нет', () => {
        expect(hasAlternativeComplects([])).toBe(false);
    });

    it('наборы есть, но без наполнения — переключателя нет', () => {
        expect(hasAlternativeComplects([bareAlternativeSet('alt_1'), bareAlternativeSet('alt_2')])).toBe(false);
    });

    it('хотя бы у одного набора есть наполнение — переключатель виден', () => {
        expect(hasAlternativeComplects([bareAlternativeSet('alt_1'), alternativeSet('alt_2', 'ur')])).toBe(true);
    });

    it('виден ровно тогда, когда поле можно отправить', () => {
        const states = [
            rootStateWithVariants([], variantItems),
            withAlternative(rootStateWithVariants([], variantItems), [bareAlternativeSet('alt_1')]),
            twoSetsState(),
        ];
        for (const state of states) {
            const sent = 'alternativeComplects' in requestOf(state, true);
            expect(hasAlternativeComplects(state.rowSet.alternative)).toBe(sent);
        }
    });

    it('подпись и пояснение описывают оба состояния', () => {
        expect(ALTERNATIVE_COMPLECTS_FIELD.label).toBe('Наполнение наборов для сравнения');
        expect(ALTERNATIVE_COMPLECTS_FIELD.hint).toContain('Выключено');
        expect(ALTERNATIVE_COMPLECTS_FIELD.hint).toContain('Включено');
    });
});

describe('настройка «Наполнение наборов для сравнения» в настройках PDF', () => {
    const enabled = run(initial, offerPdfActions.setSettings({ alternativeComplects: true }));

    /** Запись до этой настройки: поля нет. */
    const legacyStyle = {
        format: 'pdf',
        templateCode: 'iskra',
        palette: null,
        settings: { withPromo: false, salePhrase: 'акция' },
    };

    it('по умолчанию выключено', () => {
        expect(OFFER_PDF_DEFAULT_SETTINGS.alternativeComplects).toBe(false);
        expect(initial.prefs.settings.alternativeComplects).toBe(false);
        expect(normalizeOfferPdfPrefs(undefined).settings.alternativeComplects).toBe(false);
    });

    it('правка на экране включает настройку и оставляет остальные', () => {
        expect(enabled.origin).toBe('user');
        expect(enabled.prefs.settings).toEqual({ ...OFFER_PDF_DEFAULT_SETTINGS, alternativeComplects: true });
    });

    it('запись без поля и значение не того типа читаются как выключенное', () => {
        expect(normalizeOfferPdfStyle(legacyStyle).settings).toMatchObject({
            withPromo: false,
            salePhrase: 'акция',
            alternativeComplects: false,
        });
        const valueOf = (raw: unknown): OfferPdfSettings['alternativeComplects'] =>
            normalizeOfferPdfStyle(raw).settings.alternativeComplects;
        expect(valueOf({ settings: { alternativeComplects: 'да' } })).toBe(false);
        expect(valueOf({ settings: { alternativeComplects: true } })).toBe(true);
        expect(valueOf(null)).toBe(false);
    });

    it('значение попадает в слепок и возвращается при раскладке', () => {
        const pdf = offerPdfForSnapshot(enabled);
        expect(pdf?.settings.alternativeComplects).toBe(true);

        const general = { id: 'general', kind: 'general' as const, rows: [], collapsed: false };
        const written = serializeV2({
            state: {
                regionCode: null,
                contractCode: null,
                supplyCode: null,
                general,
                alternative: [],
                templateId: null,
                rqId: null,
                pdf,
            },
            dealId: 1,
            domain: 'd',
            userId: 1,
            savedAt: '2026-11-23T00:00:00.000Z',
        });
        const restored = restoreV2(JSON.parse(JSON.stringify(written))).pdf;
        expect(restored?.settings.alternativeComplects).toBe(true);

        const laidOut = run(initial, offerPdfActions.applySnapshot(restored!));
        expect(laidOut.origin).toBe('snapshot');
        expect(laidOut.prefs.settings.alternativeComplects).toBe(true);
    });

    it('слепок без поля при раскладке выключает настройку и сохраняет номер документа', () => {
        const edited = run(enabled, offerPdfActions.setDocumentNumber('17'));
        const merged = mergeOfferPdfSnapshot(edited.prefs, legacyStyle);
        expect(merged.settings.alternativeComplects).toBe(false);
        expect(merged.documentNumber).toBe('17');
    });

    it('запоминается так же, как стиль: уходит в выбор менеджера и в избранное', () => {
        expect(offerPdfStyleOf(enabled.prefs).settings.alternativeComplects).toBe(true);
        expect(offerPdfForLibrary(enabled)?.settings.alternativeComplects).toBe(true);
        // выбор менеджера возвращается из кэша тем же разбором, что слепок
        const cached = normalizeOfferPdfStyle(JSON.parse(JSON.stringify(offerPdfStyleOf(enabled.prefs))));
        expect(cached.settings.alternativeComplects).toBe(true);
        const manager = run(initial, offerPdfActions.applyManager(cached));
        expect(manager.prefs.settings.alternativeComplects).toBe(true);
    });
});
