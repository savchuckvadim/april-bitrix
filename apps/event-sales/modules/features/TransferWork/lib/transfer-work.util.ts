import type { TransferWorkRunDto } from '@workspace/nest-event-sales-api';

/**
 * «Передать работу» (просьба клиента, решение владельца 22–26.10.2026):
 * любой сотрудник выбирает коллегу и передаёт ему работу по клиенту.
 *
 * Что переезжает — решает хук transfer-work на бэке: открытые сделки
 * наших воронок, компания, контакты, открытые лиды, задачи и дела —
 * новому ответственному и «Менеджеру по продажам Гарант». Сделки
 * презентаций и ХО закрываются (прежнее решение клиента), отчёты и KPI не
 * меняются. Здесь — только что именно передаём и как сказать об итоге.
 */

export const TRANSFER_WORK_TEXT = {
    button: 'Передать работу',
    title: 'Передать работу по клиенту',
    description:
        'Выбранному сотруднику перейдут открытые сделки клиента, компания, ' +
        'контакты, открытые лиды и задачи — он станет ответственным и ' +
        'менеджером по продажам. Сделки презентаций и холодного обзвона ' +
        'закроются. Отчёты и показатели не меняются.',
    label: 'Кому передать',
    placeholder: 'Выберите сотрудника',
    search: 'Фамилия или имя…',
    empty: 'Сотрудник не найден',
    confirm: 'Передать',
    cancel: 'Отмена',
    working: 'Передаём работу…',
    done: (name: string) => `Работа передана: ${name}.`,
    failed: 'Не удалось передать работу — попробуйте ещё раз.',
    reload: 'Обновить приложение',
    close: 'Закрыть',
} as const;

/** Что передаём: компания и/или сделки; владелец — кого исключить из списка. */
export interface TransferWorkScope {
    companyId: number | null;
    dealIds: number[];
    /** Нынешний ответственный работы: передавать ему же бессмысленно. */
    ownerId: number | null;
}

interface CrmRowLike {
    ID?: unknown;
    ASSIGNED_BY_ID?: unknown;
}

const positiveId = (value: unknown): number | null => {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
};

/**
 * Что передавать из контекста фрейма: компания клиента и сделка, из которой
 * открыли. Без компании и сделки (лид) передавать нечего — null.
 */
export function resolveTransferScope(input: {
    company: CrmRowLike | null;
    deal: CrmRowLike | null;
}): TransferWorkScope | null {
    const companyId = positiveId(input.company?.ID);
    const dealId = positiveId(input.deal?.ID);
    if (!companyId && !dealId) return null;
    return {
        companyId,
        dealIds: dealId ? [dealId] : [],
        ownerId:
            positiveId(input.deal?.ASSIGNED_BY_ID) ??
            positiveId(input.company?.ASSIGNED_BY_ID),
    };
}

/** Своё отдаём (give), чужое передаём (take) — тело одно, маршрут для журнала. */
export const transferAction = (
    scope: TransferWorkScope,
    initiatorId: number | null,
): 'give' | 'take' =>
    initiatorId !== null && scope.ownerId === initiatorId ? 'give' : 'take';

/** Тело запроса хука: все задачи, включая просроченные; стадии не трогаем. */
export function buildTransferRequest(input: {
    scope: TransferWorkScope;
    domain: string;
    initiatorId: number | null;
    newResponsibleId: number;
}): TransferWorkRunDto {
    const { scope } = input;
    return {
        domain: input.domain,
        ...(input.initiatorId ? { initiatorUserId: input.initiatorId } : {}),
        ...(scope.companyId ? { companyId: scope.companyId } : {}),
        ...(scope.dealIds.length ? { dealIds: scope.dealIds } : {}),
        newResponsibleId: input.newResponsibleId,
        includeOverdue: true,
        moveMainDealToCold: false,
        createCallTask: false,
    };
}

/** Предупреждения хука из результата операции — как есть, только текст. */
export function transferWarnings(result: unknown): string[] {
    const warnings =
        result && typeof result === 'object'
            ? (result as { warnings?: unknown }).warnings
            : undefined;
    return Array.isArray(warnings)
        ? warnings.filter(
              (item): item is string =>
                  typeof item === 'string' && item.trim() !== '',
          )
        : [];
}
