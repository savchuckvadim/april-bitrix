import { describe, expect, it } from 'vitest';
import { answerKey } from '@/modules/entities/Questionnaire/lib/answer-key';
import type { QuestionnaireItem } from '@/modules/entities/Questionnaire/model/questionnaire.type';
import {
    hasChecklistChoice,
    resolveChecklistField,
    type ChecklistEntityRows,
    type ResolvedChecklistField,
} from './checklist-values';
import { toChecklistBooleanValue } from './checklist-boolean';
import { isChecklistFieldMissing } from './checklist-selectors';
import { checklistAnswerLabel } from './checklist-answer-label';

/**
 * Контролы, которых у движка не было: «да/нет» ТРЕМЯ состояниями и свой
 * список ответов у обычного строкового поля.
 *
 * Главное здесь — «не выбрано» не является ответом. В опроснике после
 * презентации это уже стоит граблями: галка по построению двусостоянийна, и
 * её выключенное положение неотличимо от молчания менеджера.
 */
const UF_KEY = 'UF_CRM_1712345678';

const item = (over: Partial<QuestionnaireItem> = {}): QuestionnaireItem => ({
    code: 'client_ready',
    title: 'Клиент готов купить',
    placeholder: null,
    hint: null,
    groupTitle: null,
    sort: 10,
    control: 'boolean',
    isRequired: true,
    requireChange: false,
    staleAfterDays: null,
    channel: 'crm',
    dtoPath: null,
    target: { mode: 'auto', entity: null },
    smart: null,
    isNative: false,
    field: { name: UF_KEY, type: 'boolean' },
    legacyFieldCode: null,
    options: [],
    ...over,
});

const rows = (raw: unknown): ChecklistEntityRows => ({
    company: null,
    deal: { ID: '10', [UF_KEY]: raw },
    lead: null,
});

const resolve = (
    def: QuestionnaireItem,
    raw: unknown,
): ResolvedChecklistField => {
    const resolved = resolveChecklistField(
        { answerKey: answerKey('call', def.code), def },
        null,
        rows(raw),
    );
    if (!resolved) throw new Error('вопрос не резолвится');
    return resolved;
};

describe('Контрол «да/нет»: три состояния', () => {
    it('пустое поле — «не выбрано», а не «Нет»', () => {
        const resolved = resolve(item(), '');

        expect(resolved.currentValue).toBe('');
        expect(resolved.currentLabel).toBe('');
        // Обязательный вопрос остаётся незакрытым: молчание не ответ.
        expect(isChecklistFieldMissing(resolved, undefined, undefined)).toBe(
            true,
        );
    });

    it('«1» — ответ «Да», «0» — только подпись «сейчас: Нет»', () => {
        expect(resolve(item(), '1').currentValue).toBe('Y');
        expect(resolve(item(), '1').currentLabel).toBe('Да');
        // Значение в CRM менеджер обязан видеть — подпись остаётся; но
        // значением контрола ноль не становится: селект показывает «—».
        expect(resolve(item(), '0').currentValue).toBe('');
        expect(resolve(item(), '0').currentLabel).toBe('Нет');
    });

    it('«0» из CRM не закрывает обязательный вопрос', () => {
        // Ноль в UF-поле типа boolean стоит и у вопроса, которого никто не
        // касался: закрой им обязательность — и отчёт уедет с ответом,
        // которого менеджер не давал.
        for (const raw of ['0', false, 'N']) {
            expect(
                isChecklistFieldMissing(
                    resolve(item(), raw),
                    undefined,
                    undefined,
                ),
            ).toBe(true);
        }
        // «Да» дефолтом не появляется — это настоящий ответ.
        expect(
            isChecklistFieldMissing(resolve(item(), '1'), undefined, undefined),
        ).toBe(false);
    });

    it('другие написания портала тоже понятны', () => {
        expect(toChecklistBooleanValue(true)).toBe('Y');
        expect(toChecklistBooleanValue('Y')).toBe('Y');
        expect(toChecklistBooleanValue(false)).toBe('N');
        expect(toChecklistBooleanValue('n')).toBe('N');
        // Всё нераспознанное — «не выбрано»: приписывать менеджеру ответ,
        // которого он не давал, нельзя.
        expect(toChecklistBooleanValue(null)).toBe('');
        expect(toChecklistBooleanValue('мусор')).toBe('');
    });

    it('ответ «Нет» закрывает обязательный вопрос', () => {
        const resolved = resolve(item(), '');

        expect(isChecklistFieldMissing(resolved, 'N', undefined)).toBe(false);
        expect(checklistAnswerLabel(resolved.def, 'N')).toBe('Нет');
    });
});

describe('Строка со своим списком ответов', () => {
    const CHOICE = item({
        code: 'promise',
        title: 'Что обещал клиент',
        control: 'string',
        field: { name: UF_KEY, type: 'string' },
        options: [
            { code: 'pay_now', title: 'Оплатит сейчас', bitrixId: null },
            { code: 'think', title: 'Думает', bitrixId: null },
        ],
    });

    it('список объявляет сам вопрос — справочника в CRM нет', () => {
        expect(hasChecklistChoice(CHOICE)).toBe(true);
        // У справочника Битрикса своя ветка: там значение уходит bitrixId.
        expect(hasChecklistChoice(item({ control: 'enumeration' }))).toBe(
            false,
        );
        // Своего списка нет — обычная строка.
        expect(
            hasChecklistChoice(item({ control: 'string', options: [] })),
        ).toBe(false);
    });

    it('в поле лежит текст варианта — контрол показывает этот вариант', () => {
        const resolved = resolve(CHOICE, 'Оплатит сейчас');

        expect(resolved.currentValue).toBe('pay_now');
        expect(resolved.currentLabel).toBe('Оплатит сейчас');
    });

    it('код в поле тоже принимается — значения бывают старше списка', () => {
        expect(resolve(CHOICE, 'pay_now').currentValue).toBe('pay_now');
    });

    it('чужой текст остаётся текстом и вопрос закрывает', () => {
        const resolved = resolve(CHOICE, 'своими словами');

        expect(resolved.currentValue).toBe('своими словами');
        expect(resolved.currentLabel).toBe('своими словами');
        expect(isChecklistFieldMissing(resolved, undefined, undefined)).toBe(
            false,
        );
    });

    it('в комментарий уходит название варианта, а не код', () => {
        expect(checklistAnswerLabel(CHOICE, 'think')).toBe('Думает');
    });
});

/**
 * Штатное поле сделки (`SOURCE_ID`, `OPPORTUNITY`): пользовательского типа
 * у него нет, поэтому админка пропускает такой пункт мимо матрицы «тип поля
 * → контрол» — справочный вопрос на штатном поле законен и приезжает с
 * вариантами.
 *
 * Варианты ему нужны ровно те же, что и UF-полю. Без них справочник рисуется
 * свободной строкой, запись отменяется молча (варианта в резолве нет), а
 * обязательный вопрос запирает отправку — то есть каталог блокирует отчёт,
 * чего он делать не имеет права.
 */
describe('Штатное поле со справочником', () => {
    const NATIVE_KEY = 'SOURCE_ID';

    const NATIVE_ENUM = item({
        code: 'source',
        title: 'Источник обращения',
        control: 'enumeration',
        isNative: true,
        // У штатного поля типа пользовательского поля нет — отсюда null.
        field: { name: NATIVE_KEY, type: null },
        options: [
            { code: 'call', title: 'Звонок', bitrixId: 7 },
            { code: 'web', title: 'Сайт', bitrixId: 8 },
        ],
    });

    const nativeRows = (raw: unknown): ChecklistEntityRows => ({
        company: null,
        deal: { ID: '10', [NATIVE_KEY]: raw },
        lead: null,
    });

    const nativeResolve = (
        def: QuestionnaireItem,
        raw: unknown,
    ): ResolvedChecklistField | null =>
        resolveChecklistField(
            { answerKey: answerKey('call', def.code), def },
            null,
            nativeRows(raw),
        );

    it('варианты каталога доходят до контрола и читают значение сделки', () => {
        const resolved = nativeResolve(NATIVE_ENUM, '7');
        if (!resolved) throw new Error('вопрос не резолвится');

        // Пустой список рисовал бы вместо селекта обычную строку.
        expect(resolved.options).toHaveLength(2);
        expect(resolved.ufKey).toBe(NATIVE_KEY);
        expect(resolved.currentValue).toBe('call');
        expect(resolved.currentLabel).toBe('Звонок');
        // Значение из CRM закрывает обязательный вопрос — отправка свободна.
        expect(isChecklistFieldMissing(resolved, undefined, undefined)).toBe(
            false,
        );
    });

    it('справочник без вариантов прячется, а не запирает отправку', () => {
        expect(nativeResolve(item({ ...NATIVE_ENUM, options: [] }), '')).toBe(
            null,
        );
    });

    it('свой список у штатной строки тоже виден резолву', () => {
        const CHOICE = item({
            ...NATIVE_ENUM,
            control: 'string',
            options: [
                { code: 'pay_now', title: 'Оплатит сейчас', bitrixId: null },
            ],
        });
        const resolved = nativeResolve(CHOICE, 'Оплатит сейчас');
        if (!resolved) throw new Error('вопрос не резолвится');

        // Запись сверяется с `resolved.options`: пустой список отправил бы
        // в поле код варианта вместо названия.
        expect(resolved.options).toHaveLength(1);
        expect(resolved.currentValue).toBe('pay_now');
    });
});

describe('Многострочный ответ', () => {
    it('читается и хранится как обычная строка', () => {
        const TEXT = item({
            code: 'client_words',
            title: 'Слова клиента',
            control: 'text',
            field: { name: UF_KEY, type: 'string' },
        });
        const resolved = resolve(TEXT, 'сказал, что дорого\nи ушёл думать');

        expect(resolved.currentValue).toBe('сказал, что дорого\nи ушёл думать');
        expect(isChecklistFieldMissing(resolved, undefined, undefined)).toBe(
            false,
        );
    });
});
