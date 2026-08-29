import { describe, expect, it } from 'vitest';
import {
    findQuestionnaireCodeConflict,
    questionnaireCodeGuard,
    toQuestionnaireCode,
} from './questionnaire-code';
import type { PortalQuestionnaireListItem } from '../model';

const listItem = (
    patch: Partial<PortalQuestionnaireListItem> = {},
): PortalQuestionnaireListItem => ({
    id: 'q-1',
    appCode: 'event-sales',
    code: 'plan_basics',
    title: 'Что узнать до звонка',
    purpose: 'plan',
    place: 'plan',
    itemsCount: 3,
    issuesCount: 0,
    isActive: true,
    sort: 500,
    version: 1,
    updatedAt: null,
    ...patch,
});

describe('toQuestionnaireCode', () => {
    it('переводит название в латиницу', () => {
        expect(toQuestionnaireCode('Что узнать до звонка')).toBe(
            'chto_uznat_do_zvonka',
        );
    });

    it('схлопывает знаки препинания в один разделитель', () => {
        expect(toQuestionnaireCode('Отчёт: решение')).toBe('otchet_reshenie');
    });

    it('не оставляет разделителей по краям', () => {
        expect(toQuestionnaireCode('  Привет!  ')).toBe('privet');
    });

    it('латиницу и цифры оставляет как есть', () => {
        expect(toQuestionnaireCode('Sale 2026')).toBe('sale_2026');
    });

    it('название без латинской пары даёт пустой код', () => {
        // Подставлять «questionnaire_1» нельзя: код читают глазами рядом с
        // ответами, а про пустое название и так скажет проверка черновика.
        expect(toQuestionnaireCode('???')).toBe('');
        expect(toQuestionnaireCode('   ')).toBe('');
    });
});

describe('findQuestionnaireCodeConflict', () => {
    const list = [listItem(), listItem({ id: 'q-2', code: 'report_basics' })];

    it('находит анкету, которую перезапишет сохранение', () => {
        // Создание на бэке — upsert по паре «приложение + код»: занятый код
        // не отвергается, он заменяет чужую анкету вместе с составом.
        expect(
            findQuestionnaireCodeConflict(list, 'event-sales', 'plan_basics')
                ?.id,
        ).toBe('q-1');
    });

    it('саму себя конфликтом не считает', () => {
        expect(
            findQuestionnaireCodeConflict(
                list,
                'event-sales',
                'plan_basics',
                'q-1',
            ),
        ).toBeNull();
    });

    it('тот же код в другом приложении конфликтом не является', () => {
        expect(
            findQuestionnaireCodeConflict(list, 'kpi-sales', 'plan_basics'),
        ).toBeNull();
    });

    it('пустой код ничего не занимает', () => {
        expect(
            findQuestionnaireCodeConflict(list, 'event-sales', '   '),
        ).toBeNull();
    });
});

describe('questionnaireCodeGuard', () => {
    it('прочитанный список снимает запрет', () => {
        expect(
            questionnaireCodeGuard(true, { isSuccess: true, isError: false }),
        ).toBeNull();
    });

    it('непрочитанный список запирает создание, а не разрешает его', () => {
        // Пустой поиск конфликта по несуществующему списку неотличим от
        // «код свободен», а POST делает upsert — заменил бы чужую анкету.
        expect(
            questionnaireCodeGuard(true, { isSuccess: false, isError: true }),
        ).toBe('failed');
    });

    it('пока список едет, создание тоже заперто', () => {
        expect(
            questionnaireCodeGuard(true, { isSuccess: false, isError: false }),
        ).toBe('pending');
    });

    it('правку сохранённой анкеты список не держит', () => {
        // Она уходит по своему `id`, а код и приложение read-only —
        // заменить чужую анкету ей нечем.
        expect(
            questionnaireCodeGuard(false, { isSuccess: false, isError: true }),
        ).toBeNull();
    });
});
