import type { DuplicateContext } from '@/modules/app/lib/utills/app-state-util';
import type { DepartmentRole } from '@/modules/features/Departament/lib/department-role-util';
import {
    DUPLICATE_ENTITY_TYPE,
    type DuplicateCandidate,
    type MergeCardsResult,
} from '../model';
import { canManageJoin } from './join-to-main.util';

/**
 * «ОБЪЕДИНИТЬ КАРТОЧКИ» — две карточки компании одного клиента сливаются
 * методом Битрикса (crm.entity.mergeBatch, хук merge-duplicates). Это
 * НЕОБРАТИМО: остаётся самая старая карточка, остальные удаляются. Поэтому
 * сначала план (пробный прогон, ничего не пишет), потом подтверждение с
 * подписью плана — портал изменился между шагами, сервер откажет.
 *
 * Только руководителю (фронт прячет, сервер проверяет) и только для
 * компании-кандидата, когда текущая сделка тоже при компании.
 */

export const MERGE_CARDS_TEXT = {
    button: 'Объединить карточки компаний…',
    hint:
        'Если это одна и та же организация, заведённая дважды, карточки ' +
        'можно объединить — сначала покажем, что останется.',
    planning: 'Готовим план объединения…',
    planTitle: 'Объединить карточки — отменить нельзя',
    survivor: (id: number) =>
        `Останется компания №${id} — самая старая из двух.`,
    victims: (ids: number[]) =>
        `В неё будут слиты и удалены: ${ids.map(id => `№${id}`).join(', ')}. ` +
        'Сделки, контакты и дела перейдут в оставшуюся.',
    relink: (count: number) => `Сделок получат компанию: ${count}.`,
    nothing: 'Объединять нечего — карточки уже одна или в разных воронках.',
    confirm: 'Объединить безвозвратно',
    cancel: 'Отмена',
    merging: 'Объединяем…',
    done: (id: number) => `Объединено: осталась компания №${id}.`,
    conflict:
        'Битрикс не смог объединить автоматически (поля конфликтуют). ' +
        'Откройте в Битриксе CRM → Дубликаты и объедините вручную.',
    reload: 'Обновить приложение',
} as const;

export interface MergeCardsTarget {
    readonly allowed: boolean;
    /** Ссылки для хука: `COMPANY_<текущая>`, `COMPANY_<кандидат>`. */
    readonly entityRefs: string[];
}

const NOT_ALLOWED: MergeCardsTarget = { allowed: false, entityRefs: [] };

/** Можно ли предложить слияние карточек — правило в одном месте. */
export const resolveMergeTarget = (
    candidate: DuplicateCandidate | undefined,
    context: DuplicateContext,
    role: DepartmentRole,
): MergeCardsTarget => {
    if (!candidate || !canManageJoin(role)) return NOT_ALLOWED;
    if (candidate.entityType !== DUPLICATE_ENTITY_TYPE.COMPANY) {
        return NOT_ALLOWED;
    }
    const companyId = context.companyId;
    if (!companyId || companyId === candidate.id) return NOT_ALLOWED;
    return {
        allowed: true,
        entityRefs: [`COMPANY_${companyId}`, `COMPANY_${candidate.id}`],
    };
};

/** План/итог по-человечески: что останется, что удалится, что перейдёт. */
export interface MergeCardsPlanView {
    readonly survivorId: number | null;
    readonly lines: string[];
    readonly hasWork: boolean;
    readonly conflict: boolean;
}

export const mergePlanView = (
    result: MergeCardsResult | null,
): MergeCardsPlanView => {
    const group = result?.groups[0] ?? null;
    if (!result || !group) {
        return {
            survivorId: null,
            lines: [MERGE_CARDS_TEXT.nothing, ...(result?.warnings ?? [])],
            hasWork: false,
            conflict: false,
        };
    }
    return {
        survivorId: group.survivorId,
        lines: [
            MERGE_CARDS_TEXT.survivor(group.survivorId),
            MERGE_CARDS_TEXT.victims(group.victimIds),
            ...(result.relink.length
                ? [MERGE_CARDS_TEXT.relink(result.relink.length)]
                : []),
            ...result.skipped,
            ...result.warnings,
        ],
        hasWork: group.victimIds.length > 0,
        conflict: result.groups.some(item => item.status === 'CONFLICT'),
    };
};
