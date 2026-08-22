import { describe, expect, it } from 'vitest';
import type { EventTask } from '@/modules/entities/EventTask';
import type { RelatedLead } from '@/modules/entities/RelatedCrm';
import {
    buildTaskLeadLinksView,
    inheritsLeadLink,
    pickDefaultLeadIds,
} from './task-lead-links';

const task = (ufCrmTask: string[]): EventTask =>
    ({ id: 1, name: 'Дело', ufCrmTask }) as unknown as EventTask;

const lead = (id: number, statusSemanticId = 'P'): RelatedLead =>
    ({ id, title: `Заявка ${id}`, statusSemanticId }) as RelatedLead;

const dated = (
    id: number,
    dateCreate: string,
    extra: Partial<RelatedLead> = {},
): RelatedLead => ({ ...lead(id), dateCreate, ...extra }) as RelatedLead;

describe('inheritsLeadLink', () => {
    it('лид в привязках текущей задачи — наследуется', () => {
        expect(inheritsLeadLink(task(['CO_5', 'L_77']))).toBe(true);
    });

    it('привязок лида нет — наследовать нечего', () => {
        expect(inheritsLeadLink(task(['CO_5', 'D_9']))).toBe(false);
        expect(inheritsLeadLink(null)).toBe(false);
    });
});

describe('buildTaskLeadLinksView', () => {
    it('текущей задачи нет — предлагаем открытые связанные лиды', () => {
        const view = buildTaskLeadLinksView({
            currentTask: null,
            planActive: true,
            leads: [lead(1), lead(2)],
        });
        expect(view.visible).toBe(true);
        expect(view.candidates.map(item => item.id)).toEqual([1, 2]);
    });

    it('у текущей задачи заявки нет — тоже спрашиваем', () => {
        const view = buildTaskLeadLinksView({
            currentTask: task(['CO_5', 'D_9']),
            planActive: true,
            leads: [lead(1), lead(2), lead(3)],
        });
        expect(view.visible).toBe(true);
        expect(view.candidates).toHaveLength(3);
    });

    it('заявка у текущей задачи уже есть — не спрашиваем', () => {
        const view = buildTaskLeadLinksView({
            currentTask: task(['L_77']),
            planActive: true,
            leads: [lead(1)],
        });
        expect(view).toEqual({ visible: false, candidates: [] });
    });

    it('закрытые лиды в кандидаты не идут', () => {
        const view = buildTaskLeadLinksView({
            currentTask: null,
            planActive: true,
            leads: [lead(1, 'S'), lead(2, 'F'), lead(3)],
        });
        expect(view.candidates.map(item => item.id)).toEqual([3]);
    });

    it('без плана связывать нечего', () => {
        const view = buildTaskLeadLinksView({
            currentTask: null,
            planActive: false,
            leads: [lead(1)],
        });
        expect(view).toEqual({ visible: false, candidates: [] });
    });

    it('открытых лидов нет — блока нет', () => {
        const view = buildTaskLeadLinksView({
            currentTask: null,
            planActive: true,
            leads: [lead(1, 'S')],
        });
        expect(view.visible).toBe(false);
    });
});

describe('pickDefaultLeadIds', () => {
    it('по умолчанию — самая свежая заявка', () => {
        expect(
            pickDefaultLeadIds([
                dated(1, '2026-01-01', { questUrl: 'https://q/1' }),
                dated(2, '2026-08-01', { questUrl: 'https://q/2' }),
            ]),
        ).toEqual([2]);
    });

    it('заявка приоритетнее свежего лида', () => {
        expect(
            pickDefaultLeadIds([
                dated(1, '2026-08-01'),
                dated(2, '2026-01-01', { regNumber: 'A-1' }),
            ]),
        ).toEqual([2]);
    });

    it('заявок нет — берём самый свежий лид', () => {
        expect(
            pickDefaultLeadIds([dated(1, '2026-01-01'), dated(2, '2026-08-01')]),
        ).toEqual([2]);
    });

    it('кандидатов нет — отмечать нечего', () => {
        expect(pickDefaultLeadIds([])).toEqual([]);
    });
});
