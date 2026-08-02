/**
 * Тесты арифметики покрытия. Проверяем четыре состояния, ради которых вообще
 * затевалась страница: разрыв, стык, перекрытие и полное дублирование, — плюс
 * правило «лид не владеет конверсионным хвостом».
 */

import { describe, expect, it } from 'vitest';
import { SALES_PRESETS } from '../constants/presets';
import { SALES_PROCESS } from '../constants/sales-process';
import { ProcessConfig } from '../types';
import { deriveProcessModel } from './coverage';

const model = (leadPct: number, dealPct: number) =>
    deriveProcessModel(SALES_PROCESS, { leadPct, dealPct, answers: {} });

const preset = (id: string): ProcessConfig => {
    const found = SALES_PRESETS.find(item => item.id === id);
    if (!found) throw new Error(`Нет пресета ${id}`);
    return { leadPct: found.leadPct, dealPct: found.dealPct, answers: {} };
};

const TOTAL = SALES_PROCESS.stages.length;
const ELIGIBLE = SALES_PROCESS.stages.filter(stage => stage.canBeLead).length;

describe('хребет процесса продажи', () => {
    it('содержит десять стадий, конверсионный хвост — только закрывающая', () => {
        expect(TOTAL).toBe(10);
        expect(ELIGIBLE).toBe(9);
        expect(SALES_PROCESS.stages.at(-1)?.id).toBe('sales_success');
        expect(SALES_PROCESS.stages.at(-1)?.isClosing).toBe(true);
    });

    it('«Поставка» доступна лиду: сделка на ней ещё активна', () => {
        const supply = SALES_PROCESS.stages.find(
            stage => stage.id === 'sales_supply',
        );
        expect(supply?.canBeLead).toBe(true);
    });

    it('«Поставка» стоит перед «Успехом»', () => {
        const ids = SALES_PROCESS.stages.map(stage => stage.id);
        expect(ids.indexOf('sales_supply')).toBeLessThan(
            ids.indexOf('sales_success'),
        );
    });
});

describe('границы крутилок', () => {
    it('лид на 0 % не покрывает ничего', () => {
        const result = model(0, 100);
        expect(result.leadEnd).toBe(-1);
        expect(result.stages.every(view => !view.isLeadCovered)).toBe(true);
        expect(result.callsApp.inLead).toBe(false);
    });

    it('сделка на 0 % покрывает ровно закрывающую стадию', () => {
        const result = model(100, 0);
        expect(result.dealStart).toBe(TOTAL - 1);
        expect(result.stages.filter(view => view.isDealCovered)).toHaveLength(
            1,
        );
    });

    it('сделка на 100 % покрывает весь хребет', () => {
        expect(model(0, 100).dealStart).toBe(0);
    });

    it('лид никогда не заходит в конверсионный хвост', () => {
        const result = model(100, 100);
        const tail = result.stages.filter(view => !view.stage.canBeLead);

        expect(tail).toHaveLength(1);
        expect(tail.every(view => !view.isLeadCovered)).toBe(true);
        expect(result.leadEnd).toBe(ELIGIBLE - 1);
    });

    it('конверсионный хвост держит сделка даже на нулевой крутилке', () => {
        // Иначе в конце воронки висела бы стадия, которую не ведёт никто.
        const result = model(0, 0);
        const tail = result.stages.filter(view => !view.stage.canBeLead);

        expect(tail.every(view => view.isDealCovered)).toBe(true);
        expect(tail.every(view => view.owner === 'deal')).toBe(true);
    });

    it('чинит мусор на входе вместо того, чтобы падать', () => {
        expect(model(-40, 999).leadEnd).toBe(-1);
        expect(model(Number.NaN, 100).leadEnd).toBe(-1);
    });
});

describe('четыре состояния покрытия', () => {
    it('разрыв: между лидом и сделкой есть ничьи стадии', () => {
        const result = model(20, 0);

        expect(result.relation).toBe('gap');
        expect(result.gapCount).toBeGreaterThan(0);
        expect(result.overlapCount).toBe(0);
    });

    it('стык: покрытия смыкаются ровно, без нахлёста и без дыры', () => {
        const result = model(50, 45);

        expect(result.leadEnd + 1).toBe(result.dealStart);
        expect(result.relation).toBe('seam');
        expect(result.gapCount).toBe(0);
        expect(result.overlapCount).toBe(0);
    });

    it('«как сейчас» — тоже чистый стык, а не разрыв', () => {
        const result = deriveProcessModel(SALES_PROCESS, preset('as-is'));

        expect(result.relation).toBe('seam');
        expect(result.gapCount).toBe(0);
    });

    it('перекрытие: часть стадий держат обе сущности сразу', () => {
        const result = model(75, 50);

        expect(result.relation).toBe('overlap');
        expect(result.overlapCount).toBeGreaterThan(0);
        expect(result.gapCount).toBe(0);
        expect(result.stages.some(view => view.owner === 'both')).toBe(true);
    });

    it('полное дублирование на максимуме обеих крутилок', () => {
        const result = model(100, 100);

        expect(result.relation).toBe('duplicate');
        expect(result.overlapCount).toBe(ELIGIBLE);
        expect(result.callsApp.isSplit).toBe(true);
    });
});

describe('размещение приложения «Звонки»', () => {
    it('«как сейчас» — только в лиде: закрывающая стадия не рабочее место', () => {
        const result = deriveProcessModel(SALES_PROCESS, preset('as-is'));

        expect(result.callsApp.inLead).toBe(true);
        expect(result.callsApp.inDeal).toBe(false);
        expect(result.callsApp.isSplit).toBe(false);
    });

    it('«только сделки» — единственный интерфейс менеджера', () => {
        const result = deriveProcessModel(SALES_PROCESS, preset('deals-only'));

        expect(result.callsApp.inLead).toBe(false);
        expect(result.callsApp.inDeal).toBe(true);
    });

    it('«пополам» — менеджер работает в двух местах', () => {
        const result = deriveProcessModel(SALES_PROCESS, preset('half'));

        expect(result.callsApp.isSplit).toBe(true);
    });
});

describe('рекомендованная схема «Админ + Сделка»', () => {
    it('рекомендованный пресет ровно один', () => {
        expect(SALES_PRESETS.filter(item => item.recommended)).toHaveLength(1);
    });

    it('это 15 % лида и 90 % сделки', () => {
        const recommended = SALES_PRESETS.find(item => item.recommended)!;

        expect(recommended.id).toBe('admin-filter');
        expect(recommended.leadPct).toBe(15);
        expect(recommended.dealPct).toBe(90);
        expect(recommended.whyRecommended).toBeTruthy();
    });

    it('даёт чистый стык без разрыва и без перекрытия', () => {
        const result = deriveProcessModel(
            SALES_PROCESS,
            preset('admin-filter'),
        );

        expect(result.relation).toBe('seam');
        expect(result.gapCount).toBe(0);
        expect(result.overlapCount).toBe(0);
    });

    it('лид держит только вход, менеджер работает лишь в сделке', () => {
        const result = deriveProcessModel(
            SALES_PROCESS,
            preset('admin-filter'),
        );

        expect(result.leadEnd).toBe(0);
        expect(result.stages[0]?.stage.id).toBe('sales_new');
        // Разбирает вход администратор, поэтому «Звонки» в лиде не появляются.
        expect(result.callsApp.inLead).toBe(false);
        expect(result.callsApp.inDeal).toBe(true);
        expect(result.callsApp.isSplit).toBe(false);
    });
});

describe('«Звонки» стоят там, где работает именно менеджер', () => {
    it('стадии системы и руководителя рабочим местом не считаются', () => {
        // Лид покрывает только «Новую» — её ведёт система.
        expect(model(15, 90).callsApp.inLead).toBe(false);
        // Дотянули лид до «Переговоров» — там уже менеджер.
        expect(model(35, 90).callsApp.inLead).toBe(true);
    });
});

describe('все пресеты остаются осмысленными', () => {
    it.each(SALES_PRESETS.map(item => [item.id, item] as const))(
        '%s — каждая стадия получает ровно одного владельца',
        (_id, item) => {
            const result = deriveProcessModel(SALES_PROCESS, {
                leadPct: item.leadPct,
                dealPct: item.dealPct,
                answers: {},
            });

            expect(result.stages).toHaveLength(TOTAL);
            result.stages.forEach(view => {
                expect(view.owner).toBe(
                    view.isLeadCovered && view.isDealCovered
                        ? 'both'
                        : view.isLeadCovered
                          ? 'lead'
                          : view.isDealCovered
                            ? 'deal'
                            : 'none',
                );
            });
        },
    );
});
