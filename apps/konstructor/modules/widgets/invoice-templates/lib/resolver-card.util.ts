import type {
    InvoiceTemplate,
    ResolvedInvoiceState,
} from '@/modules/entities/invoice-template';

/** Что показывает карточка подбора. */
export type ResolverCardKind = 'idle' | 'loading' | 'found' | 'missing' | 'error';

export interface ResolverCardView {
    kind: ResolverCardKind;
    title: string;
    /** Пояснение под заголовком: почему именно этот шаблон или что делать. */
    details: string | null;
    /** Найденный шаблон из загруженного списка; нет в списке, значит `null`. */
    template: InvoiceTemplate | null;
}

export const MISSING_TEMPLATE_DETAILS =
    'Счёт с этими признаками не соберётся. Добавьте шаблон под этот случай или общий шаблон без ограничений по типам.';

/**
 * Карточка «Сейчас уйдёт шаблон»: ответ подбора переводится в заголовок и
 * пояснение. Пока идёт повторный запрос, прежний ответ остаётся на экране.
 */
export const resolverCardView = (
    state: ResolvedInvoiceState,
    templates: readonly InvoiceTemplate[],
): ResolverCardView => {
    if (state.status === 'idle') {
        return {
            kind: 'idle',
            title: 'Подбор шаблона недоступен',
            details: 'Не определён портал приложения.',
            template: null,
        };
    }
    if (state.status === 'error') {
        return {
            kind: 'error',
            title: 'Не удалось определить шаблон',
            details: state.error,
            template: null,
        };
    }
    if (!state.value) {
        return {
            kind: 'loading',
            title: 'Подбираем шаблон…',
            details: null,
            template: null,
        };
    }
    if (state.value.templateId === null) {
        return {
            kind: 'missing',
            title: 'Подходящего шаблона нет',
            details: MISSING_TEMPLATE_DETAILS,
            template: null,
        };
    }
    const id = state.value.templateId;
    const template = templates.find(item => item.id === id) ?? null;
    return {
        kind: 'found',
        title: `Сейчас уйдёт шаблон: «${template?.name ?? `№${id}`}»`,
        details: state.value.reason,
        template,
    };
};
