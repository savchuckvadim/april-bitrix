import { describe, expect, it } from 'vitest';
import {
    forecastBacktest,
    shadowForecast,
} from '@/modules/entities/ai-analytics/__tests__/ai-forecast-fixtures';
import { AI_CHECKLIST_PHASE4_TEXT } from '../ai-setup-checklist.phase4.texts';
import { aiChecklistTheoryTopic } from '../ai-setup-checklist.data';
import {
    AI_CHECKLIST_ACTION,
    AI_CHECKLIST_GROUP,
    AI_CHECKLIST_ITEM,
    AI_CHECKLIST_VERDICT,
} from '../ai-setup-checklist.types';
import {
    aiChecklistVerdict,
    buildAiChecklistItems,
} from '../ai-setup-checklist.util';
import {
    checklistInput,
    itemOf,
    readiness,
    settings,
} from './ai-setup-checklist.fixtures';

const T = AI_CHECKLIST_PHASE4_TEXT;
const withReasons = (reasons: string[]) => ({
    settings: settings({ readiness: readiness({ reasons }) }),
});

describe('прогноз копится в тени', () => {
    it('с ответом прогноза: «4 из 9 месяцев», прогресс и примерный срок', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.FORECAST_SHADOW, {
            ...withReasons(['forecast-shadow-months-below-9']),
            forecast: shadowForecast(),
        });
        expect(item?.group).toBe(AI_CHECKLIST_GROUP.WAIT);
        expect(item?.title).toBe('Прогноз копится в тени: 4 из 9 месяцев');
        expect(item?.progress).toEqual({ value: 4, target: 9 });
        // Сегодня 26.09.2026: осталось 5 месяцев → 1 февраля.
        expect(item?.eta).toEqual({
            date: '2027-02-01',
            rough: true,
            time: null,
        });
        expect(item?.detail).toContain('Когда наберётся 9 месяцев');
        // Показ включает разработчик — не «ступень откроется сама».
        expect(item?.detail).toContain('попросите разработчика включить показ');
        expect(item?.detail).not.toContain('откроется сама');
        expect(item?.unlocks).toBe(T.forecastShadow.unlocks);
    });

    it('без ответа прогноза (не руководитель): сколько нужно, без прогресса и срока', () => {
        const item = itemOf(
            AI_CHECKLIST_ITEM.FORECAST_SHADOW,
            withReasons(['forecast-shadow-months-below-6']),
        );
        expect(item?.title).toBe(
            'Прогноз копится в тени: нужно 6 месяцев сверки с фактом',
        );
        expect(item?.progress).toBeNull();
        expect(item?.eta).toBeNull();
    });

    it('журнала ещё нет — «начинает копиться», 0 из нужного', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.FORECAST_SHADOW, {
            ...withReasons(['forecast-log-missing']),
            forecast: shadowForecast({
                asOf: null,
                shadow: { monthsLogged: 0, minMonths: 9, backtest: null },
                reasons: ['forecast-log-missing'],
            }),
        });
        expect(item?.title).toBe(T.forecastShadow.startTitle);
        expect(item?.progress).toEqual({ value: 0, target: 9 });
    });

    it('журнал копится, проверки ещё не было — прогресс, а не пропавший пункт', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.FORECAST_SHADOW, {
            ...withReasons(['forecast-log-missing']),
            forecast: shadowForecast({
                shadow: { monthsLogged: 2, minMonths: 9, backtest: null },
                reasons: ['forecast-log-missing'],
            }),
        });
        expect(item?.title).toBe('Прогноз копится в тени: 2 из 9 месяцев');
        expect(item?.progress).toEqual({ value: 2, target: 9 });
        expect(item?.eta?.date).toBe('2027-04-01');
    });

    it('причин прогноза нет — пункта нет; тема теории — «в тени»', () => {
        expect(itemOf(AI_CHECKLIST_ITEM.FORECAST_SHADOW)).toBeUndefined();
        expect(aiChecklistTheoryTopic(AI_CHECKLIST_ITEM.FORECAST_SHADOW)).toBe(
            'forecastShadow',
        );
    });
});

describe('точность прогноза на истории', () => {
    it('факт реже попадает в вилку — пункт WAIT с точностью словами', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.FORECAST_ACCURACY, {
            ...withReasons(['forecast-coverage-outside']),
            forecast: shadowForecast({
                shadow: {
                    monthsLogged: 9,
                    minMonths: 9,
                    backtest: forecastBacktest({
                        status: 'fail',
                        coverageShare: 0.7,
                    }),
                },
                reasons: ['forecast-coverage-outside'],
            }),
        });
        expect(item?.group).toBe(AI_CHECKLIST_GROUP.WAIT);
        expect(item?.title).toBe(T.forecastAccuracy.title);
        expect(item?.detail).toContain('в 7 случаях из 10 (нужно 8 из 10)');
    });

    it('без ответа прогноза — подписи причин', () => {
        const item = itemOf(
            AI_CHECKLIST_ITEM.FORECAST_ACCURACY,
            withReasons(['forecast-mase-not-below']),
        );
        expect(item?.detail).toBe('Прогноз пока не точнее простых правил.');
    });

    it('мало данных, пока месяцев в тени не хватает, — только пункт «в тени»', () => {
        const reasons = [
            'forecast-shadow-months-below-9',
            'forecast-backtest-insufficient',
        ];
        expect(
            itemOf(AI_CHECKLIST_ITEM.FORECAST_ACCURACY, withReasons(reasons)),
        ).toBeUndefined();
        const alone = itemOf(
            AI_CHECKLIST_ITEM.FORECAST_ACCURACY,
            withReasons(['forecast-backtest-insufficient']),
        );
        expect(alone?.title).toBe(T.forecastAccuracy.titleInsufficient);
    });
});

describe('ступень пройдена, показ не включён', () => {
    it('прогноз: CONFIGURE по желанию, «попросите разработчика», итог не блокирует', () => {
        const input = checklistInput(withReasons(['forecast-stage-disabled']));
        const items = buildAiChecklistItems(input);
        const item = items.find(
            row => row.code === AI_CHECKLIST_ITEM.FORECAST_STAGE,
        );
        expect(item?.group).toBe(AI_CHECKLIST_GROUP.CONFIGURE);
        expect(item?.optional).toBe(true);
        expect(item?.title).toBe(
            'Прогноз готов — попросите разработчика включить показ',
        );
        expect(item?.actions).toEqual([
            { kind: AI_CHECKLIST_ACTION.TEXT, text: T.forecastStage.fix },
        ]);
        expect(aiChecklistVerdict(items)).toBe(AI_CHECKLIST_VERDICT.READY);
    });

    it('советы: аналогичный пункт, тема теории — эффект советов', () => {
        const item = itemOf(
            AI_CHECKLIST_ITEM.RECOMMENDATIONS_STAGE,
            withReasons(['recommendations-stage-disabled']),
        );
        expect(item?.title).toBe(
            'Советы проверены — попросите разработчика включить показ',
        );
        expect(item?.optional).toBe(true);
        // «До и после» — совпадение с ростом, а не доказанная польза.
        expect(item?.detail).toContain('не доказательство');
        expect(item?.detail).not.toContain('подтверждена');
        expect(
            aiChecklistTheoryTopic(AI_CHECKLIST_ITEM.RECOMMENDATIONS_STAGE),
        ).toBe('recommendationsEffect');
    });
});

describe('советы проверяются', () => {
    it('причины ожидания словами одной строкой; код с гейтом тоже', () => {
        const item = itemOf(
            AI_CHECKLIST_ITEM.RECOMMENDATIONS,
            withReasons([
                'recommendations-issued-below-30',
                'recommendations-no-positive-edge',
            ]),
        );
        expect(item?.group).toBe(AI_CHECKLIST_GROUP.WAIT);
        expect(item?.title).toBe(T.recommendations.title);
        expect(item?.actions ?? []).toEqual([]);
        expect(item?.detail).toBe(
            'Советов с завершённой проверкой пока меньше 30; после советов шаги воронки пока не улучшились.',
        );
    });

    it('мало отметок «Сделано» — не «подождать», а «настроить» с действием', () => {
        const input = withReasons([
            'recommendations-issued-below-30',
            'recommendations-done-share-below',
        ]);
        const item = itemOf(AI_CHECKLIST_ITEM.RECOMMENDATIONS, input);
        expect(item?.group).toBe(AI_CHECKLIST_GROUP.CONFIGURE);
        expect(item?.title).toBe(T.recommendations.titleMarks);
        expect(item?.detail).toBe(
            'Советов с завершённой проверкой пока меньше 30; советы выполняют реже, чем нужно для оценки их пользы.',
        );
        expect(item?.actions).toEqual([
            { kind: AI_CHECKLIST_ACTION.TEXT, text: T.recommendations.markDone },
        ]);
        expect(
            aiChecklistVerdict(buildAiChecklistItems(checklistInput(input))),
        ).not.toBe(AI_CHECKLIST_VERDICT.WAIT);
    });

    it('частые несогласия — разбор, а не «отмечайте чаще «Не согласен»»', () => {
        const item = itemOf(
            AI_CHECKLIST_ITEM.RECOMMENDATIONS,
            withReasons(['recommendations-disagree-above']),
        );
        expect(item?.group).toBe(AI_CHECKLIST_GROUP.CONFIGURE);
        expect(item?.title).toBe(T.recommendations.titleDisagree);
        expect(item?.actions).toEqual([
            {
                kind: AI_CHECKLIST_ACTION.TEXT,
                text: T.recommendations.reviewDisagree,
            },
        ]);
    });

    it('гейт выданных для долей — тоже ожидание советов, со своей подписью', () => {
        const item = itemOf(
            AI_CHECKLIST_ITEM.RECOMMENDATIONS,
            withReasons([
                'recommendations-issued-below-20',
                'recommendations-shares-issued-below-8',
            ]),
        );
        expect(item?.group).toBe(AI_CHECKLIST_GROUP.WAIT);
        expect(item?.detail).toBe(
            'Советов с завершённой проверкой пока меньше 20; выдано советов пока меньше 8 — долю выполненных ещё не считаем.',
        );
    });

    it('«показ не включён» в пункт ожидания не попадает', () => {
        expect(
            itemOf(
                AI_CHECKLIST_ITEM.RECOMMENDATIONS,
                withReasons(['recommendations-stage-disabled']),
            ),
        ).toBeUndefined();
    });
});

describe('коды Фазы 4 известны чек-листу', () => {
    it('ни один код ступеней не уходит в «Новая причина режима»', () => {
        const items = buildAiChecklistItems(
            checklistInput(
                withReasons([
                    'forecast-shadow-months-below-9',
                    'forecast-backtest-insufficient',
                    'forecast-coverage-outside',
                    'forecast-mase-not-below',
                    'forecast-stage-disabled',
                    'forecast-log-missing',
                    'recommendations-needs-forecast',
                    'recommendations-issued-below-30',
                    'recommendations-shares-issued-below-8',
                    'recommendations-done-share-below',
                    'recommendations-disagree-above',
                    'recommendations-no-positive-edge',
                    'recommendations-goodhart-flags',
                    'recommendations-stage-disabled',
                    'recommendations-effect-missing',
                ]),
            ),
        );
        expect(
            items.filter(item => item.code === AI_CHECKLIST_ITEM.REASON),
        ).toEqual([]);
    });
});
