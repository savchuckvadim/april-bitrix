import { describe, expect, it } from 'vitest';
import type {
    ModelForecastBreakdownManager,
    ModelForecastBreakdownResult,
} from '../model';
import { toBreakdownView } from './forecast-breakdown-view.util';

/** toLocaleString('ru-RU') ставит неразрывные пробелы — в тестах обычные. */
const plain = (text: string): string => text.replace(/\s/g, ' ');

const manager = (
    fields: Partial<ModelForecastBreakdownManager> = {},
): ModelForecastBreakdownManager => ({
    managerId: '15',
    p50: 5.4,
    done: 2,
    pipeline: 1.1,
    newFlow: 2.3,
    naive: 4,
    target: 6,
    entryDone: 38,
    entryRate: 3.5,
    conversion: 0.06,
    fBar: 0.55,
    openEpisodes: 27,
    topEpisodes: [
        { id: 'deal:1', ageDays: 34, theta: 0.42, expected: 0.18 },
        { id: null, ageDays: 210, theta: 0.3, expected: 0.05 },
    ],
    ...fields,
});

const result = (
    fields: Partial<ModelForecastBreakdownResult> = {},
): ModelForecastBreakdownResult => ({
    domain: 'portal.bitrix24.ru',
    day: '2026-11-16',
    department: {
        day: '2026-11-16',
        monthKey: '2026-11',
        p50: 46,
        low: 38,
        high: 55,
        done: 21,
        pipeline: 9.5,
        newFlow: 15.5,
        naive: 44,
        mean3: 41.3,
        managers: 12,
        pipelineUnknown: 0,
    },
    managers: [manager()],
    ...fields,
});

describe('разложение прогноза: вид карточки', () => {
    it('отдел: прогноз с границами и три слагаемых', () => {
        const view = toBreakdownView(result());
        expect(view?.day).toContain('16.11');
        const metrics = new Map(
            view?.department.map(item => [item.label, plain(item.value)]),
        );
        // Ожидаемые продажи — с одним знаком после запятой, как всё в разделе.
        expect(metrics.get('Прогноз за месяц')).toBe('46,0 (от 38,0 до 55,0)');
        expect(metrics.get('Закрыто')).toBe('21');
        expect(metrics.get('Открытые сделки')).toBe('9,5');
        expect(metrics.get('Новые встречи')).toBe('15,5');
        expect(metrics.get('По темпу')).toBe('44,0');
        expect(metrics.get('Менеджеров в расчёте')).toBe('12');
        expect(view?.note).toBeNull();
    });

    it('менеджер: слагаемые, входы расчёта и сделки; давняя сделка с вкладом помечается', () => {
        const row = toBreakdownView(result())?.rows[0];
        expect(row).toMatchObject({
            managerId: '15',
            p50: '5,4',
            done: '2',
            pipeline: '1,1',
            newFlow: '2,3',
            target: '6,0',
            openDeals: '27',
            hasOldDeals: true,
        });
        expect(plain(row?.inputs ?? '')).toBe(
            'сделано 38 · 3,5 в день · в продажу 6,0 % · успеет закрыться 55 %',
        );
        expect(row?.deals.map(plain)).toEqual([
            'deal:1 · открыта 34 дн. · шанс 42 % · вклад 0,18',
            'без ключа · открыта 210 дн. · шанс 30 % · вклад 0,05',
        ]);
    });

    it('давняя сделка без вклада прогноз не тянет — пометки нет', () => {
        const row = toBreakdownView(
            result({
                managers: [
                    manager({
                        topEpisodes: [
                            { id: 'deal:9', ageDays: 400, theta: 0.9, expected: 0 },
                        ],
                    }),
                ],
            }),
        )?.rows[0];
        expect(row?.hasOldDeals).toBe(false);
    });

    it('запись до появления разложения: прочерки, не нули, и пояснение', () => {
        const base = result();
        const view = toBreakdownView(
            result({
                department: base.department && {
                    ...base.department,
                    pipeline: null,
                    newFlow: null,
                    mean3: null,
                },
                managers: [
                    manager({
                        pipeline: null,
                        target: null,
                        entryDone: null,
                        entryRate: null,
                        conversion: null,
                        fBar: null,
                        openEpisodes: null,
                        topEpisodes: [],
                    }),
                ],
            }),
        );
        const metrics = new Map(
            view?.department.map(item => [item.label, item.value]),
        );
        expect(metrics.get('Открытые сделки')).toBe('—');
        expect(metrics.get('Новые встречи')).toBe('—');
        expect(view?.note).toContain('не сохранены');
        expect(view?.rows[0]).toMatchObject({
            pipeline: '—',
            target: '—',
            inputs: '—',
            openDeals: '—',
            deals: [],
        });
    });

    it('у части менеджеров нет истории стадий — предупреждение', () => {
        const base = result();
        const view = toBreakdownView(
            result({
                department: base.department && {
                    ...base.department,
                    pipelineUnknown: 3,
                },
            }),
        );
        const managers = view?.department.find(
            item => item.label === 'Менеджеров в расчёте',
        );
        expect(managers?.value).toContain('у 3 нет истории стадий');
        expect(managers?.tone).toBe('warning');
    });

    it('журнала прогноза нет — честная заглушка', () => {
        expect(
            toBreakdownView(result({ day: null, department: null, managers: [] })),
        ).toBeNull();
    });
});
