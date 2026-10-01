import { describe, expect, it } from 'vitest';
import { APP_FROM_ENUM } from '@/modules/app/model/slice/AppSlice';
import type { DuplicateContext } from '@/modules/app/lib/utills/app-state-util';
import { EDepartmentRole } from '@/modules/features/Departament/lib/department-role-util';
import {
    DUPLICATE_ENTITY_TYPE,
    type DuplicateCandidate,
    type MergeCardsResult,
} from '../model';
import {
    MERGE_CARDS_TEXT,
    mergePlanView,
    resolveMergeTarget,
} from './merge-cards.util';

const context = (companyId: number | null): DuplicateContext => ({
    from: APP_FROM_ENUM.DEAL,
    companyId,
    leadId: null,
    dealId: 10,
    hasCompany: companyId !== null,
});

const company = (id: number) =>
    ({ entityType: DUPLICATE_ENTITY_TYPE.COMPANY, id }) as DuplicateCandidate;

const HEAD = EDepartmentRole.DEPARTMENT_HEAD;

describe('«Объединить карточки»: кому и когда', () => {
    it('руководитель, компания-кандидат, у сделки своя компания — можно', () => {
        expect(resolveMergeTarget(company(7), context(5), HEAD)).toEqual({
            allowed: true,
            entityRefs: ['COMPANY_5', 'COMPANY_7'],
        });
    });

    it('рядовой менеджер — нельзя', () => {
        expect(
            resolveMergeTarget(company(7), context(5), EDepartmentRole.EMPLOYEE)
                .allowed,
        ).toBe(false);
    });

    it('у сделки нет компании или кандидат — она же — нельзя', () => {
        expect(resolveMergeTarget(company(7), context(null), HEAD).allowed).toBe(
            false,
        );
        expect(resolveMergeTarget(company(5), context(5), HEAD).allowed).toBe(
            false,
        );
    });

    it('кандидат не компания — нельзя (контакты и лиды тут не сливаем)', () => {
        const lead = {
            entityType: DUPLICATE_ENTITY_TYPE.LEAD,
            id: 7,
        } as DuplicateCandidate;
        expect(resolveMergeTarget(lead, context(5), HEAD).allowed).toBe(false);
    });
});

describe('«Объединить карточки»: план по-человечески', () => {
    const plan = (patch: Partial<MergeCardsResult> = {}): MergeCardsResult => ({
        implemented: true,
        dryRun: true,
        planHash: 'h',
        groups: [
            {
                entityType: 'COMPANY',
                survivorId: 5,
                victimIds: [7],
                status: 'PLANNED',
                mergedIds: [],
            },
        ],
        relink: [{ dealId: 1, companyId: 5 }],
        skipped: [],
        warnings: [],
        message: '',
        ...patch,
    });

    it('что останется, что удалится, сколько сделок получат компанию', () => {
        expect(mergePlanView(plan())).toEqual({
            survivorId: 5,
            lines: [
                MERGE_CARDS_TEXT.survivor(5),
                MERGE_CARDS_TEXT.victims([7]),
                MERGE_CARDS_TEXT.relink(1),
            ],
            hasWork: true,
            conflict: false,
        });
    });

    it('объединять нечего — без кнопки «Объединить»', () => {
        expect(mergePlanView(plan({ groups: [] })).hasWork).toBe(false);
        expect(mergePlanView(null).lines[0]).toBe(MERGE_CARDS_TEXT.nothing);
    });

    it('Битрикс не смог слить автоматически — конфликт', () => {
        const conflict = plan({
            groups: [
                {
                    entityType: 'COMPANY',
                    survivorId: 5,
                    victimIds: [7],
                    status: 'CONFLICT',
                    mergedIds: [],
                },
            ],
        });
        expect(mergePlanView(conflict).conflict).toBe(true);
    });
});
