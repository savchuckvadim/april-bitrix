import { describe, expect, it } from 'vitest';
import {
    findSmartBindingByEventType,
    findSmartBindingByTypeGroup,
    isQuestionnaireReachableForSmart,
} from './event-smart-registry';
import { describeSmartTarget } from './smart-target-view';
import { portalSmart } from './questionnaire.fixture';
import { questionnaireSchemaFixture as schema } from './questionnaire-schema.fixture';
import type { PortalQuestionnaireCondition } from '../model';

/** Смарт презентаций и смарт, которого нет в реестре потоков. */
const presentationSmart = portalSmart();
const strangerSmart = portalSmart({
    id: 9,
    type: 'invoice',
    title: 'Счета',
});

const conditions = (
    ...list: PortalQuestionnaireCondition[]
): PortalQuestionnaireCondition[] => list;

describe('event-smart-registry: связь «тип события → смарт»', () => {
    it('узнаёт смарт по паре type/group строки smarts', () => {
        expect(findSmartBindingByTypeGroup('pres', 'sales')?.kind).toBe(
            'presentation',
        );
        expect(findSmartBindingByTypeGroup('zpr', 'sales')?.kind).toBe('zpr');
        expect(findSmartBindingByTypeGroup('pres', 'other')).toBeUndefined();
    });

    it('узнаёт смарт по типу события — на нём держится матрица', () => {
        expect(findSmartBindingByEventType('presentation')?.kind).toBe(
            'presentation',
        );
        expect(findSmartBindingByEventType('hot')?.kind).toBe('zpr');
        // У звонка смарта нет: ответ туда писать некуда.
        expect(findSmartBindingByEventType('warm')).toBeUndefined();
    });

    it('достижимость даёт тип события любого из двух видов условия', () => {
        const binding = findSmartBindingByTypeGroup('pres', 'sales')!;

        expect(
            isQuestionnaireReachableForSmart(
                conditions({ kind: 'planType', values: ['presentation'] }),
                binding,
            ),
        ).toBe(true);
        expect(
            isQuestionnaireReachableForSmart(
                conditions({
                    kind: 'reportType',
                    values: ['warm', 'presentation'],
                }),
                binding,
            ),
        ).toBe(true);
    });

    it('«Презентация проведена» достижима только смарту презентаций', () => {
        // Спонтанная презентация: тип задачи обычный звонок, а элемент
        // создаётся презентационный.
        const presentation = findSmartBindingByTypeGroup('pres', 'sales')!;
        const zpr = findSmartBindingByTypeGroup('zpr', 'sales')!;
        const done = conditions({ kind: 'presentationDone', values: [] });

        expect(isQuestionnaireReachableForSmart(done, presentation)).toBe(true);
        expect(isQuestionnaireReachableForSmart(done, zpr)).toBe(false);
    });

    it('стадия, статус работы и «Всегда» достижимости не дают', () => {
        const binding = findSmartBindingByTypeGroup('zpr', 'sales')!;

        expect(
            isQuestionnaireReachableForSmart(
                conditions(
                    { kind: 'targetStage', values: ['sales_success'] },
                    { kind: 'workStatus', values: ['inJob'] },
                    { kind: 'always', values: [] },
                ),
                binding,
            ),
        ).toBe(false);
    });
});

describe('describeSmartTarget', () => {
    it('пускает поле смарта, когда анкета привязана к его типу события', () => {
        const target = describeSmartTarget(
            7,
            [presentationSmart],
            conditions({ kind: 'reportType', values: ['presentation'] }),
            schema,
        );

        expect(target.blockReason).toBeNull();
        expect(target.smart?.title).toBe('Презентации');
        // Владелец должен прочитать, куда именно уедет ответ.
        expect(target.hint).toContain('Ответ уедет в элемент смарта');
        expect(target.hint).toContain('Презентация');
    });

    it('без условия по типу события смарта называет, что добавить', () => {
        const target = describeSmartTarget(
            7,
            [presentationSmart],
            conditions({ kind: 'reportType', values: ['warm'] }),
            schema,
        );

        expect(target.blockReason).toContain(
            'не привязана к типу события смарта',
        );
        // Текст ведёт к действию: назвать тип события и упомянуть
        // «Презентацию проведена» — это тот же отказ, что дал бы бэк.
        expect(target.blockReason).toContain('Презентация');
        expect(target.blockReason).toContain('«Презентация проведена»');
        expect(target.hint).toBeNull();
    });

    it('у смарта без потока события говорит, что писать некуда', () => {
        const target = describeSmartTarget(
            9,
            [strangerSmart],
            conditions({ kind: 'reportType', values: ['presentation'] }),
            schema,
        );

        expect(target.blockReason).toContain('нет потока события');
        expect(target.blockReason).toContain('Счета');
    });

    it('чужой смарт называет по идентификатору', () => {
        const target = describeSmartTarget(
            77,
            [presentationSmart],
            conditions({ kind: 'reportType', values: ['presentation'] }),
            schema,
        );

        expect(target.blockReason).toContain('не установлен на этом портале');
    });

    it('пока смарты портала не прочитаны, поля не открывает', () => {
        // Молчать в этот момент нельзя: поля выглядели бы выбираемыми, а
        // разрешение на них никто не проверял.
        const target = describeSmartTarget(
            7,
            undefined,
            conditions({ kind: 'reportType', values: ['presentation'] }),
            schema,
        );

        expect(target.blockReason).toContain('ещё не прочитаны');
    });

    it('вопрос без смарта отклоняет теми же словами, что и бэк', () => {
        const target = describeSmartTarget(
            null,
            [presentationSmart],
            conditions({ kind: 'reportType', values: ['presentation'] }),
            schema,
        );

        expect(target.blockReason).toContain('Не указан смарт');
    });
});
