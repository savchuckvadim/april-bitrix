import { APP_FROM_ENUM } from '@/modules/app/model/slice/AppSlice';
import type { DuplicateContext } from '@/modules/app/lib/utills/app-state-util';
import {
    EDepartmentRole,
    type DepartmentRole,
} from '@/modules/features/Departament/lib/department-role-util';
import { DUPLICATE_ENTITY_TYPE, type DuplicateCandidate } from '../model';

/** К чему присоединяем текущую сделку — зеркало JoinToMainRunDto.targetType. */
export type JoinTargetType = 'deal' | 'company';

export interface JoinToMainTarget {
    /** Кнопку показываем и даём нажать. */
    allowed: boolean;
    /** Почему нельзя — для подсказки; null, когда allowed. */
    reason: string | null;
    targetType: JoinTargetType | null;
    targetId: number | null;
    /** Текущая сделка контекста — она и есть присоединяемый дубль. */
    dealId: number | null;
}

export const JOIN_TO_MAIN_TEXT = {
    button: 'Присоединить сюда',
    confirmTitle: 'Присоединить текущую сделку?',
    confirmDeal: (title: string) =>
        `Контакты, лид, задачи и дела текущей сделки перейдут в «${title}», ` +
        'а сама она закроется стадией «Дубль». Ничего не удаляется.',
    confirmCompany: (title: string) =>
        `Контакты уйдут в компанию «${title}», работа — в её самую старую ` +
        'открытую сделку ОП; текущая сделка закроется стадией «Дубль». ' +
        'Открытой сделки у компании нет — текущая останется основной и ' +
        'получит компанию.',
    confirm: 'Подтвердить',
    cancel: 'Отмена',
    working: 'Присоединяем…',
    retry: 'Повторить',
    openMain: 'Открыть основную сделку',
    reload: 'Обновить приложение',
    onlyHead: 'Присоединять сделки может только руководитель.',
    onlyFromDeal: 'Присоединить можно только текущую сделку — откройте приложение из неё.',
    onlyDealOrCompany: 'Присоединить можно к сделке или компании.',
    ownDeal: 'Это и есть текущая сделка.',
} as const;

/** Руководитель группы, отдела или супер — рядовой сотрудник кнопку не видит. */
export const canManageJoin = (role: DepartmentRole): boolean =>
    role !== EDepartmentRole.EMPLOYEE;

/**
 * Можно ли присоединить ТЕКУЩУЮ сделку к этому кандидату и как именно.
 *
 * Чистая функция: правила доступа — данные для теста, а не ветвление в
 * компоненте. Кандидат-сделка → цель deal, кандидат-компания → цель
 * company (бэк сам найдёт её открытую основную); лид и контакт целью быть
 * не могут — к ним «присоединять работу» бессмысленно.
 */
export function resolveJoinTarget(
    candidate: Pick<DuplicateCandidate, 'entityType' | 'id'>,
    context: DuplicateContext,
    role: DepartmentRole,
): JoinToMainTarget {
    const deny = (reason: string): JoinToMainTarget => ({
        allowed: false,
        reason,
        targetType: null,
        targetId: null,
        dealId: context.dealId,
    });

    if (!canManageJoin(role)) return deny(JOIN_TO_MAIN_TEXT.onlyHead);
    if (context.from !== APP_FROM_ENUM.DEAL || !context.dealId) {
        return deny(JOIN_TO_MAIN_TEXT.onlyFromDeal);
    }
    if (candidate.entityType === DUPLICATE_ENTITY_TYPE.DEAL) {
        if (candidate.id === context.dealId) {
            return deny(JOIN_TO_MAIN_TEXT.ownDeal);
        }
        return {
            allowed: true,
            reason: null,
            targetType: 'deal',
            targetId: candidate.id,
            dealId: context.dealId,
        };
    }
    if (candidate.entityType === DUPLICATE_ENTITY_TYPE.COMPANY) {
        return {
            allowed: true,
            reason: null,
            targetType: 'company',
            targetId: candidate.id,
            dealId: context.dealId,
        };
    }
    return deny(JOIN_TO_MAIN_TEXT.onlyDealOrCompany);
}
