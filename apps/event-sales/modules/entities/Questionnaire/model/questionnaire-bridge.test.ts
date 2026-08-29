import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { FALLBACK_CATALOG } from '../data/fallback-catalog';
import type { QuestionnaireDef } from './questionnaire.type';
import type {
    QuestionnaireCatalogSource,
    QuestionnaireCatalogState,
} from './QuestionnaireCatalogSlice';
import {
    selectQuestionnaireByCode,
    selectQuestionnaireDefs,
} from './selectors';

/**
 * Мост портального каталога со встроенными наборами.
 *
 * Портал заводит анкеты постепенно, а флаги `withChecklist*` на боевых
 * порталах включены: первая портальная анкета не имеет права отменить
 * шесть работающих наборов. Убирает встроенный набор только сам портал —
 * `legacyChecklistId` (или совпадением кодов), и ровно один раз: два
 * одинаковых блока на экране — это тот же вопрос, заданный дважды.
 */

const def = (over: Partial<QuestionnaireDef> = {}): QuestionnaireDef => ({
    code: 'portalRefine',
    title: 'Доработка портала',
    hint: null,
    purpose: 'plan',
    presentation: 'inline',
    place: 'plan',
    persist: 'onChange',
    conditions: [{ kind: 'planType', values: ['refine'] }],
    configKey: null,
    legacyChecklistId: null,
    sort: 10,
    items: [],
    ...over,
});

const makeState = (
    defs: QuestionnaireDef[],
    source: QuestionnaireCatalogSource = 'server',
): RootState =>
    ({
        questionnaireCatalog: {
            status: source === 'server' ? 'ready' : 'error',
            domain: 'gsr.bitrix24.ru',
            contract: 1,
            version: 1,
            hash: 'sha1',
            defs,
            source,
        } satisfies QuestionnaireCatalogState,
    }) as unknown as RootState;

const codesOf = (defs: QuestionnaireDef[]): string[] =>
    defs.map(item => item.code);

describe('действующий состав анкет', () => {
    it('каталога нет — встроенный набор действует как есть', () => {
        const state = makeState(FALLBACK_CATALOG, 'fallback');

        // Тот же массив: замещать самого себя нечем, лишней сборки нет.
        expect(selectQuestionnaireDefs(state)).toBe(FALLBACK_CATALOG);
    });

    it('портальная анкета замещает встроенный набор по legacyChecklistId — дубля нет', () => {
        const state = makeState([def({ legacyChecklistId: 'refine' })]);

        const codes = codesOf(selectQuestionnaireDefs(state));

        expect(codes).toContain('portalRefine');
        expect(codes).not.toContain('refine');
        // Остальные встроенные наборы продолжают работать: гасить флаги
        // withChecklist* на боевых порталах нельзя.
        expect(codes).toContain('pay');
        expect(codes).toContain('reportPay');
        expect(new Set(codes).size).toBe(codes.length);
    });

    it('совпадение кодов — тоже замещение, а не два блока', () => {
        const portalPay = def({
            code: 'pay',
            title: 'Оплата портала',
            legacyChecklistId: null,
        });
        const state = makeState([portalPay]);

        const defs = selectQuestionnaireDefs(state);
        const found = defs.filter(item => item.code === 'pay');

        expect(found).toHaveLength(1);
        expect(found[0]).toBe(portalPay);
    });

    it('портал завёл свой состав целиком — встроенных наборов не остаётся', () => {
        const state = makeState(
            FALLBACK_CATALOG.map((builtin, index) =>
                def({
                    code: `portal${index}`,
                    legacyChecklistId: builtin.code,
                    sort: builtin.sort,
                }),
            ),
        );

        const codes = codesOf(selectQuestionnaireDefs(state));

        expect(codes).toEqual(FALLBACK_CATALOG.map((_, i) => `portal${i}`));
    });

    it('порядок общий: место анкеты в списке задаёт её sort', () => {
        const state = makeState([
            def({ code: 'portalFirst', sort: 5, legacyChecklistId: 'refine' }),
            def({ code: 'portalLate', sort: 65 }),
        ]);

        const codes = codesOf(selectQuestionnaireDefs(state));

        expect(codes[0]).toBe('portalFirst');
        expect(codes.indexOf('portalLate')).toBe(
            codes.indexOf('reportDecision') + 1,
        );
    });

    it('анкету по коду находит и портальную, и уцелевшую встроенную', () => {
        // Цепочка модалок в send() открывает анкету по коду: не найдя
        // встроенный набор, она молча пропустила бы обязательный шаг.
        const state = makeState([def({ legacyChecklistId: 'refine' })]);

        expect(selectQuestionnaireByCode(state, 'portalRefine')?.title).toBe(
            'Доработка портала',
        );
        expect(selectQuestionnaireByCode(state, 'sale')?.code).toBe('sale');
        expect(selectQuestionnaireByCode(state, 'refine')).toBeUndefined();
    });
});
