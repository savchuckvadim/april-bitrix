import { APP_FROM_ENUM } from '@/modules/app/model/slice/AppSlice';
import type { DuplicateContext } from '@/modules/app/lib/utills/app-state-util';
import { DUPLICATE_ENTITY_TYPE, type DuplicateEntityType } from '../model';

/**
 * От какой сущности искать дубли в текущем контексте.
 *
 * `manualOnly` — искать не от чего: приложение открыто там, где клиента ещё
 * нет (пустая сделка без компании и контакта, карточка звонка без привязки).
 * Тогда панель предлагает ввести ИНН или название руками.
 */
export interface DuplicateTarget {
    entityType?: DuplicateEntityType;
    entityId?: number;
    /** Пояснение для интерфейса: по кому именно ищем. */
    label: string;
    manualOnly: boolean;
}

/**
 * Правила «что ищем в каком from» — данные, а не логика в компоненте.
 *
 * Смысл в том, что «кто перед нами» и «где открыто приложение» — разные
 * вещи. Из сделки искать нужно по её компании, а не по самой сделке: дубли
 * бывают у контрагента, а не у сделки. Если же компании нет, отдаём сделку —
 * бэкенд сам дойдёт до её контакта.
 */
export function resolveDuplicateTarget(
    context: DuplicateContext,
): DuplicateTarget {
    const { from, companyId, leadId, dealId } = context;

    if (from === APP_FROM_ENUM.LEAD && leadId) {
        return {
            entityType: DUPLICATE_ENTITY_TYPE.LEAD,
            entityId: leadId,
            label: 'по данным лида',
            manualOnly: false,
        };
    }

    if (companyId) {
        return {
            entityType: DUPLICATE_ENTITY_TYPE.COMPANY,
            entityId: companyId,
            label: 'по данным компании',
            manualOnly: false,
        };
    }

    // Сделка без компании — особый случай: сигналы возьмём с самой сделки,
    // бэкенд дополнит их привязанным контактом.
    if (from === APP_FROM_ENUM.DEAL && dealId) {
        return {
            entityType: DUPLICATE_ENTITY_TYPE.DEAL,
            entityId: dealId,
            label: 'по данным сделки — компания не привязана',
            manualOnly: false,
        };
    }

    if (leadId) {
        return {
            entityType: DUPLICATE_ENTITY_TYPE.LEAD,
            entityId: leadId,
            label: 'по данным лида',
            manualOnly: false,
        };
    }

    return {
        label: 'клиент не определён — введите ИНН или название',
        manualOnly: true,
    };
}
