import { describe, expect, it } from 'vitest';
import type {
    AiManagerRow,
    AiSettingsInput,
} from '@/modules/entities/ai-analytics';
import {
    addAiAbsenceRow,
    buildAiSettingsForm,
    isAiSettingsTab,
    patchAiAbsenceRow,
    patchAiLevelRow,
    patchAiTargetRow,
    removeAiAbsenceRow,
    setAiRoster,
    type AiSettingsFormState,
    type AiSettingsPrefill,
} from '../ai-settings-form.util';
import {
    aiAbsenceHorizon,
    aiSettingsErrorTabs,
    aiTargetErrorKey,
    validateAiSettingsForm,
} from '../ai-settings-form.validate';
import {
    aiSettingsBreakingBlocks,
    aiSettingsPayloadBlocks,
    applyAiSettingsPayload,
    buildAiSettingsSummary,
    describeAiSettingsPayload,
    groupAiAbsences,
    toAiSettingsPayload,
} from '../ai-settings-form.payload';

const TODAY = '2026-09-22';

/** Минимальная строка обзора: форме нужны только id, уровень, источник и стаж. */
const manager = (
    managerId: string,
    level: AiManagerRow['level'] = 'middle',
): AiManagerRow =>
    ({
        managerId,
        level,
        levelSource: 'default',
        tenureMonths: 9,
    }) as AiManagerRow;

const MANAGERS = [manager('7'), manager('3', 'junior')];

const form = (): AiSettingsFormState => buildAiSettingsForm(MANAGERS);

/** Текущие блоки settings/get: цели двух уровней, личная цель, два отсутствия. */
const prefill = (): AiSettingsPrefill => ({
    targets: {
        byLevel: [
            { level: 'junior', sales: 2, presentationsMin: 25, coldPerDay: 50 },
            {
                level: 'senior',
                sales: null,
                presentationsMin: 0,
                coldPerDay: 30,
            },
        ],
        overrides: [{ managerId: 7, sales: 6 }],
    },
    absences: [
        {
            managerId: 3,
            items: [
                { from: '2026-10-01', to: '2026-10-05', kind: 'vacation' },
                { from: '2026-11-01', to: '2026-11-02', kind: 'sick' },
            ],
        },
        {
            managerId: 7,
            items: [{ from: '2026-09-25', to: '2026-09-25', kind: 'training' }],
        },
    ],
    rosterConfirmedAt: '2026-09-10',
});

describe('buildAiSettingsForm', () => {
    it('без настроек: уровни из обзора, цели по умолчанию, отсутствий нет, ничего не тронуто', () => {
        const state = form();
        expect(state.levels.map(row => row.managerId)).toEqual([7, 3]);
        expect(state.targets.map(row => row.level)).toEqual([
            'junior',
            'middle',
            'senior',
        ]);
        expect(state.targets[0]).toEqual({
            level: 'junior',
            sales: '',
            presentationsMin: '20',
            coldPerDay: '40',
        });
        expect(state.overrides).toEqual([]);
        expect(state.absences).toEqual([]);
        expect(state.roster).toBeNull();
        expect(state.rosterConfirmedAt).toBeNull();
        expect(state.dirty).toEqual([]);
        expect(toAiSettingsPayload(state)).toEqual({});
    });

    it('isAiSettingsTab — гард значения вкладки', () => {
        expect(isAiSettingsTab('absences')).toBe(true);
        expect(isAiSettingsTab('hypothesis')).toBe(true);
        expect(isAiSettingsTab('pool')).toBe(true);
        expect(isAiSettingsTab('unknown')).toBe(false);
    });
});

describe('предзаполнение из settings/get', () => {
    it('цели: уровни из настроек, отсутствующий уровень — по умолчанию, личные цели сохранены', () => {
        const state = buildAiSettingsForm(MANAGERS, prefill());
        expect(state.targets).toEqual([
            {
                level: 'junior',
                sales: '2',
                presentationsMin: '25',
                coldPerDay: '50',
            },
            {
                level: 'middle',
                sales: '',
                presentationsMin: '0',
                coldPerDay: '40',
            },
            {
                level: 'senior',
                sales: '',
                presentationsMin: '0',
                coldPerDay: '30',
            },
        ]);
        expect(state.overrides).toEqual([{ managerId: 7, sales: 6 }]);
        expect(state.dirty).toEqual([]);
        expect(toAiSettingsPayload(state)).toEqual({});
    });

    it('правка цели отправляет три уровня и личные цели без изменений', () => {
        const state = patchAiTargetRow(
            buildAiSettingsForm(MANAGERS, prefill()),
            'middle',
            'sales',
            '4',
        );
        expect(toAiSettingsPayload(state)).toEqual({
            targets: {
                byLevel: [
                    {
                        level: 'junior',
                        sales: 2,
                        presentationsMin: 25,
                        coldPerDay: 50,
                    },
                    {
                        level: 'middle',
                        sales: 4,
                        presentationsMin: 0,
                        coldPerDay: 40,
                    },
                    {
                        level: 'senior',
                        sales: null,
                        presentationsMin: 0,
                        coldPerDay: 30,
                    },
                ],
                overrides: [{ managerId: 7, sales: 6 }],
            },
        });
    });

    it('отсутствия разворачиваются в строки с id 1..n; новая строка получает следующий id', () => {
        const state = buildAiSettingsForm(MANAGERS, prefill());
        expect(state.absences).toEqual([
            {
                id: 1,
                managerId: '3',
                from: '2026-10-01',
                to: '2026-10-05',
                kind: 'vacation',
            },
            {
                id: 2,
                managerId: '3',
                from: '2026-11-01',
                to: '2026-11-02',
                kind: 'sick',
            },
            {
                id: 3,
                managerId: '7',
                from: '2026-09-25',
                to: '2026-09-25',
                kind: 'training',
            },
        ]);
        expect(state.nextAbsenceId).toBe(4);
        expect(addAiAbsenceRow(state).absences[3]?.id).toBe(4);
        expect(validateAiSettingsForm(state, TODAY).absences.size).toBe(0);
    });

    it('удаление предзаполненного отсутствия уходит полным списком; удалили все — пустой список', () => {
        let state = removeAiAbsenceRow(
            buildAiSettingsForm(MANAGERS, prefill()),
            2,
        );
        expect(toAiSettingsPayload(state)).toEqual({
            absences: [
                {
                    managerId: 3,
                    items: [
                        {
                            from: '2026-10-01',
                            to: '2026-10-05',
                            kind: 'vacation',
                        },
                    ],
                },
                {
                    managerId: 7,
                    items: [
                        {
                            from: '2026-09-25',
                            to: '2026-09-25',
                            kind: 'training',
                        },
                    ],
                },
            ],
        });
        state = removeAiAbsenceRow(removeAiAbsenceRow(state, 1), 3);
        expect(toAiSettingsPayload(state)).toEqual({ absences: [] });
    });

    it('дата подтверждения состава — из настроек, ожидающего изменения нет', () => {
        const state = buildAiSettingsForm(MANAGERS, prefill());
        expect(state.rosterConfirmedAt).toBe('2026-09-10');
        expect(state.roster).toBeNull();
        expect(
            buildAiSettingsForm(MANAGERS, {
                ...prefill(),
                rosterConfirmedAt: null,
            }).rosterConfirmedAt,
        ).toBeNull();
    });

    it('applyAiSettingsPayload — настройки после сохранения: сохранённые блоки перекрывают, снятие → null', () => {
        const current = prefill();
        expect(applyAiSettingsPayload(current, {})).toEqual(current);
        const applied = applyAiSettingsPayload(current, {
            levels: [],
            absences: [],
            rosterConfirmedAt: '',
        });
        expect(applied.targets).toEqual(current.targets);
        expect(applied.absences).toEqual([]);
        expect(applied.rosterConfirmedAt).toBeNull();
        expect(
            applyAiSettingsPayload(current, { rosterConfirmedAt: TODAY })
                .rosterConfirmedAt,
        ).toBe(TODAY);
    });
});

describe('правки помечают только свой блок', () => {
    it('уровень и since → levels, строка становится manual', () => {
        const state = patchAiLevelRow(form(), 7, { level: 'senior' });
        expect(state.dirty).toEqual(['levels']);
        expect(state.levels[0]).toMatchObject({
            level: 'senior',
            manual: true,
        });
        expect(state.levels[1]?.manual).toBe(false);
        expect(toAiSettingsPayload(state)).toEqual({
            levels: [
                { managerId: 7, level: 'senior' },
                { managerId: 3, level: 'junior' },
            ],
        });
    });

    it('цель → targets: полный список трёх уровней, пустые продажи = null', () => {
        const state = patchAiTargetRow(form(), 'middle', 'sales', '4');
        expect(state.dirty).toEqual(['targets']);
        expect(toAiSettingsPayload(state)).toEqual({
            targets: {
                byLevel: [
                    {
                        level: 'junior',
                        sales: null,
                        presentationsMin: 20,
                        coldPerDay: 40,
                    },
                    {
                        level: 'middle',
                        sales: 4,
                        presentationsMin: 0,
                        coldPerDay: 40,
                    },
                    {
                        level: 'senior',
                        sales: null,
                        presentationsMin: 0,
                        coldPerDay: 40,
                    },
                ],
                overrides: [],
            },
        });
    });

    it('отсутствия: добавить, править, удалить — блок уходит полным списком', () => {
        let state = addAiAbsenceRow(form(), '7');
        state = patchAiAbsenceRow(state, 1, {
            from: '2026-10-01',
            to: '2026-10-05',
            kind: 'sick',
        });
        state = addAiAbsenceRow(state);
        state = patchAiAbsenceRow(state, 2, {
            managerId: '7',
            from: '2026-09-25',
            to: '2026-09-26',
        });
        expect(state.dirty).toEqual(['absences']);
        expect(toAiSettingsPayload(state)).toEqual({
            absences: [
                {
                    managerId: 7,
                    items: [
                        {
                            from: '2026-09-25',
                            to: '2026-09-26',
                            kind: 'vacation',
                        },
                        { from: '2026-10-01', to: '2026-10-05', kind: 'sick' },
                    ],
                },
            ],
        });

        state = removeAiAbsenceRow(removeAiAbsenceRow(state, 1), 2);
        expect(state.absences).toEqual([]);
        expect(toAiSettingsPayload(state)).toEqual({ absences: [] });
    });

    it('состав: подтвердить сегодня, снять, вернуть «не трогали»', () => {
        let state = setAiRoster(form(), TODAY);
        expect(state.dirty).toEqual(['rosterConfirmedAt']);
        expect(toAiSettingsPayload(state)).toEqual({
            rosterConfirmedAt: TODAY,
        });
        state = setAiRoster(state, '');
        expect(toAiSettingsPayload(state)).toEqual({ rosterConfirmedAt: '' });
        state = setAiRoster(state, null);
        expect(state.dirty).toEqual([]);
        expect(toAiSettingsPayload(state)).toEqual({});
    });

    it('несколько блоков сразу — каждый один раз', () => {
        let state = patchAiLevelRow(form(), 7, { since: '2026-01-15' });
        state = patchAiLevelRow(state, 3, { since: '2026-02-01' });
        state = setAiRoster(state, TODAY);
        expect(state.dirty).toEqual(['levels', 'rosterConfirmedAt']);
        expect(aiSettingsPayloadBlocks(toAiSettingsPayload(state))).toEqual([
            'levels',
            'rosterConfirmedAt',
        ]);
    });
});

describe('validateAiSettingsForm', () => {
    it('чистая форма без ошибок', () => {
        const errors = validateAiSettingsForm(form(), TODAY);
        expect(aiSettingsErrorTabs(errors)).toEqual([]);
    });

    it('since из будущего → ошибка уровня', () => {
        const state = patchAiLevelRow(form(), 7, { since: '2026-09-23' });
        const errors = validateAiSettingsForm(state, TODAY);
        expect(errors.levels.get(7)).toBe('Дата не позже сегодня');
        expect(aiSettingsErrorTabs(errors)).toEqual(['levels']);
    });

    it('цели: диапазоны из DTO, продажи необязательны, минимумы — нет', () => {
        let state = patchAiTargetRow(form(), 'junior', 'sales', '51');
        state = patchAiTargetRow(state, 'middle', 'presentationsMin', '');
        state = patchAiTargetRow(state, 'senior', 'coldPerDay', '201');
        state = patchAiTargetRow(state, 'senior', 'presentationsMin', 'abc');
        const errors = validateAiSettingsForm(state, TODAY);
        expect(errors.targets.get(aiTargetErrorKey('junior', 'sales'))).toBe(
            'Число от 0 до 50',
        );
        expect(
            errors.targets.get(aiTargetErrorKey('middle', 'presentationsMin')),
        ).toBe('Укажите число');
        expect(
            errors.targets.get(aiTargetErrorKey('senior', 'coldPerDay')),
        ).toBe('Число от 0 до 200');
        expect(
            errors.targets.get(aiTargetErrorKey('senior', 'presentationsMin')),
        ).toBe('Укажите число');
        expect(
            errors.targets.get(aiTargetErrorKey('junior', 'coldPerDay')),
        ).toBe(undefined);
        expect(aiSettingsErrorTabs(errors)).toEqual(['targets']);
    });

    it('отсутствия: менеджер, формат, порядок дат, горизонт 90 дней, пересечения', () => {
        expect(aiAbsenceHorizon(TODAY)).toBe('2026-12-21');
        let state = addAiAbsenceRow(form());
        expect(validateAiSettingsForm(state, TODAY).absences.get(1)).toBe(
            'Выберите менеджера',
        );

        state = patchAiAbsenceRow(state, 1, {
            managerId: '7',
            from: '2026-10-01',
        });
        expect(validateAiSettingsForm(state, TODAY).absences.get(1)).toBe(
            'Даты в формате ГГГГ-ММ-ДД',
        );

        state = patchAiAbsenceRow(state, 1, { to: '2026-09-30' });
        expect(validateAiSettingsForm(state, TODAY).absences.get(1)).toBe(
            'Конец не раньше начала',
        );

        state = patchAiAbsenceRow(state, 1, { to: '2026-12-22' });
        expect(validateAiSettingsForm(state, TODAY).absences.get(1)).toBe(
            'Не дальше 90 дней вперёд (до 2026-12-21)',
        );

        state = patchAiAbsenceRow(state, 1, { to: '2026-10-10' });
        state = addAiAbsenceRow(state, '7');
        state = patchAiAbsenceRow(state, 2, {
            from: '2026-10-10',
            to: '2026-10-12',
        });
        const overlapped = validateAiSettingsForm(state, TODAY);
        expect(overlapped.absences.get(1)).toBe(
            'Пересекается с другим отсутствием менеджера',
        );
        expect(overlapped.absences.get(2)).toBe(
            'Пересекается с другим отсутствием менеджера',
        );

        // Другой менеджер в те же даты — не пересечение.
        state = patchAiAbsenceRow(state, 2, { managerId: '3' });
        expect(validateAiSettingsForm(state, TODAY).absences.size).toBe(0);
    });

    it('подтверждение состава: не позже сегодня; снятие валидно', () => {
        expect(
            validateAiSettingsForm(setAiRoster(form(), '2026-09-23'), TODAY)
                .roster,
        ).toBe('Дата не позже сегодня');
        expect(
            validateAiSettingsForm(setAiRoster(form(), ''), TODAY).roster,
        ).toBeNull();
        expect(
            validateAiSettingsForm(setAiRoster(form(), TODAY), TODAY).roster,
        ).toBeNull();
    });
});

describe('breaksSeries и сводка', () => {
    it('блоки диалога ряд не рвут; определения и потолки — рвут', () => {
        expect(
            aiSettingsBreakingBlocks({
                levels: [],
                targets: { byLevel: [] },
                absences: [],
                rosterConfirmedAt: TODAY,
            }),
        ).toEqual([]);
        expect(
            aiSettingsBreakingBlocks({
                levels: [],
                scoring: { caps: [], stopWords: [] },
                definitions: {},
            }),
        ).toEqual(['scoring', 'definitions']);
    });

    it('groupAiAbsences группирует по менеджеру и сортирует по началу', () => {
        expect(
            groupAiAbsences([
                {
                    id: 1,
                    managerId: '3',
                    from: '2026-11-01',
                    to: '2026-11-02',
                    kind: 'other',
                },
                {
                    id: 2,
                    managerId: '7',
                    from: '2026-10-05',
                    to: '2026-10-06',
                    kind: 'training',
                },
                {
                    id: 3,
                    managerId: '3',
                    from: '2026-10-01',
                    to: '2026-10-02',
                    kind: 'vacation',
                },
            ]).map(item => [item.managerId, item.items.map(i => i.from)]),
        ).toEqual([
            [3, ['2026-10-01', '2026-11-01']],
            [7, ['2026-10-05']],
        ]);
    });

    it('describeAiSettingsPayload — «что сохранено» с числами', () => {
        const payload: AiSettingsInput = {
            levels: [
                { managerId: 7, level: 'senior' },
                { managerId: 3, level: 'junior' },
            ],
            targets: { byLevel: [] },
            absences: [{ managerId: 7, items: [] }],
            rosterConfirmedAt: TODAY,
        };
        expect(describeAiSettingsPayload(payload)).toEqual([
            'Уровни менеджеров: 2 менеджера',
            'Цели по уровням',
            'Отсутствия: 1 менеджер',
            'Подтверждение состава: 22.09.2026',
        ]);
        expect(describeAiSettingsPayload({ rosterConfirmedAt: '' })).toEqual([
            'Подтверждение состава: снято',
        ]);
    });

    it('buildAiSettingsSummary — comparableFrom, коды человеком, предупреждения', () => {
        const summary = buildAiSettingsSummary(
            { levels: [{ managerId: 7, level: 'senior' }] },
            {
                id: '1',
                levels: [],
                savedAt: '2026-09-22T10:00:00Z',
                resetCount: 3,
                comparableFrom: '2026-09-22',
                paramsVersion: 'sha',
                breaksSeries: ['ai_analytics_definitions.productiveCall'],
                warnings: ['Уровень не задан менеджерам: 3'],
            },
        );
        expect(summary).toEqual({
            saved: ['Уровни менеджеров: 1 менеджер'],
            comparableFrom: '2026-09-22',
            breaks: ['Определения событий'],
            warnings: ['Уровень не задан менеджерам: 3'],
            resetCount: 3,
        });
    });
});
