import { describe, expect, it } from 'vitest';
import type {
    QuestionnaireDef,
    QuestionnaireItem,
} from '@/modules/entities/Questionnaire/model/questionnaire.type';
import {
    checklistFieldRefs,
    type ChecklistEntityRows,
} from './checklist-values';
import { buildChecklistFieldViews } from './checklist-field-view';
import { groupChecklistFields } from './checklist-field-groups';

/**
 * Порядок и секции вопросов задаёт КАТАЛОГ: `sort` и `groupTitle`.
 *
 * До этого группу выводили из префикса кода (`op_5k_client_*` → «Клиент»), а
 * порядок держался на порядке ключей в данных. С полями, которые пользователь
 * заводит на портале руками, оба приёма перестают работать: угадывать смысл
 * по имени переменной анкета не обязана, а порядок в JSON меняется от одного
 * сохранения к другому.
 */
const ufKey = (code: string): string => `UF_CRM_${code.toUpperCase()}`;

const item = (
    code: string,
    sort: number,
    groupTitle: string | null,
): QuestionnaireItem => ({
    code,
    title: code,
    placeholder: null,
    hint: null,
    groupTitle,
    sort,
    control: 'string',
    isRequired: false,
    requireChange: false,
    staleAfterDays: null,
    channel: 'crm',
    dtoPath: null,
    target: { mode: 'auto', entity: null },
    smart: null,
    isNative: false,
    field: { name: ufKey(code), type: 'string' },
    legacyFieldCode: null,
    options: [],
});

const def = (items: QuestionnaireItem[]): QuestionnaireDef => ({
    code: 'call',
    title: 'Вопросы звонка',
    hint: null,
    purpose: 'report',
    presentation: 'inline',
    place: 'report',
    persist: 'onChange',
    conditions: [{ kind: 'always', values: [] }],
    configKey: null,
    legacyChecklistId: null,
    sort: 10,
    items,
});

/** Все поля лежат на сделке — резолв ни один вопрос не отсеет. */
const rowsFor = (items: QuestionnaireItem[]): ChecklistEntityRows => ({
    company: null,
    deal: items.reduce<Record<string, unknown>>(
        (row, current) => ({ ...row, [ufKey(current.code)]: '' }),
        { ID: '10' },
    ),
    lead: null,
});

const viewsOf = (items: QuestionnaireItem[]) =>
    buildChecklistFieldViews(def(items), {
        portal: null,
        rows: rowsFor(items),
        saved: {},
        drafts: {},
        savingKeys: {},
        baseline: {},
        onChange: () => {},
        onClear: () => {},
    });

describe('Порядок вопросов', () => {
    it('сортируются по sort, а не по порядку в данных', () => {
        const items = [
            item('third', 30, null),
            item('first', 10, null),
            item('second', 20, null),
        ];

        expect(checklistFieldRefs(def(items)).map(ref => ref.def.code)).toEqual(
            ['first', 'second', 'third'],
        );
    });

    it('при равном sort порядок задаёт код — он детерминирован', () => {
        const items = [item('beta', 10, null), item('alpha', 10, null)];

        expect(checklistFieldRefs(def(items)).map(ref => ref.def.code)).toEqual(
            ['alpha', 'beta'],
        );
    });
});

describe('Секции по groupTitle', () => {
    it('заголовок ставится там, где группа сменилась', () => {
        const items = [
            item('who', 10, 'Клиент'),
            item('ready', 20, 'Клиент'),
            item('lpr', 30, 'Компания'),
        ];

        expect(
            groupChecklistFields(viewsOf(items)).map(group => ({
                title: group.title,
                codes: group.fields.map(field => field.def.code),
            })),
        ).toEqual([
            { title: 'Клиент', codes: ['who', 'ready'] },
            { title: 'Компания', codes: ['lpr'] },
        ]);
    });

    it('группы нет — одна секция без полосы', () => {
        const items = [item('one', 10, null), item('two', 20, null)];
        const groups = groupChecklistFields(viewsOf(items));

        expect(groups).toHaveLength(1);
        expect(groups[0]?.title).toBeNull();
    });

    it('вопросы вне секций и в секции идут своими блоками', () => {
        const items = [item('plain', 10, null), item('who', 20, 'Клиент')];

        expect(
            groupChecklistFields(viewsOf(items)).map(group => group.title),
        ).toEqual([null, 'Клиент']);
    });

    it('разорванная группа не склеивается — порядок задаёт админ анкеты', () => {
        // Собрать разбросанные вопросы в одну секцию значило бы молча
        // переставить их местами.
        const items = [
            item('who', 10, 'Клиент'),
            item('lpr', 20, 'Компания'),
            item('ready', 30, 'Клиент'),
        ];

        expect(
            groupChecklistFields(viewsOf(items)).map(group => group.title),
        ).toEqual(['Клиент', 'Компания', 'Клиент']);
    });
});
