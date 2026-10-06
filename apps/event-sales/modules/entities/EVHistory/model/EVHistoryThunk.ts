import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { getEntityDescriptor } from '@/modules/entities/RelatedCrm/lib/entity-descriptor';
// Прямой путь, а не барель сущности: тот тянет за собой UI.
import { ensureRelatedDetails } from '@/modules/entities/RelatedCrm/model/RelatedCrmThunk';
import { getTaskLinks } from '@/modules/entities/EventTask/lib/task-links';
import { HistoryListHelper } from '../lib/api/history-list-helper';
import { getHistoryListRef, HistoryListRef } from '../lib/history-list';
import {
    annotateLeadBindings,
    buildHistoryBindings,
    collectDiscoveredBindings,
} from '../lib/bindings';
import { mapHistoryElement } from '../lib/map-history-item';
import { HistoryBinding } from './history-record.type';
import { eventHistoryActions } from './EVHistorySlice';

const historyHelper = new HistoryListHelper();

/**
 * История по ВСЕМ привязкам контекста из портального списка «ОП История».
 *
 * Ленивая: вызывается при первом показе раскрытой секции истории —
 * повторный вызов гасят status-гварды ниже.
 * Сначала собираем множество привязок (сущности контекста + связи из
 * `/duplicates/details` + CRM-привязки задачи), затем ОДНИМ batch'ем берём
 * первые 50 записей каждой ленты. Связи могли не загрузиться — тогда честно
 * работаем с тем, что есть: история по контексту лучше пустого экрана.
 */
export const loadEventSalesHistory =
    (options: { reset?: boolean } = {}) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const history = state.eventHistory;
        if (history.status === 'loading') return;
        if (!options.reset && history.status === 'ready') return;

        const ref = getHistoryListRef(state.portal.portal);
        if (!ref) {
            dispatch(eventHistoryActions.setListMissing());
            return;
        }

        const { company, deal, lead, from } = state.app.bitrix;
        const descriptor = getEntityDescriptor({ from, company, deal, lead });
        if (!descriptor) return;

        dispatch(eventHistoryActions.setLoading());

        // Полный граф связей (с закрытыми сделками: их ленты — самая ценная
        // часть архива) — через общий стор: готовый берётся сразу, летящий
        // дожидаемся, отсутствующий запрашиваем один раз на всех
        // потребителей. Не получилось — null: история по контексту лучше
        // пустого экрана.
        const related = await dispatch(ensureRelatedDetails());

        const bindings = annotateLeadBindings(
            buildHistoryBindings({
                company,
                deal,
                lead,
                related,
                taskLinks: getTaskLinks(state.eventTask.current),
            }),
            related,
            state.portal.portal,
        );
        if (!bindings.length) {
            dispatch(eventHistoryActions.setInitial({ groups: [] }));
            return;
        }

        try {
            const groups = await loadGroupsPages(ref, bindings);

            // Второй проход: связи, о которых CRM не знает, а история знает —
            // старые записи несут `L_`/`D_`/`C_` привязки прямо в поле crm
            // (лид работал по компании без COMPANY_ID на себе и т.п.).
            const discovered = collectDiscoveredBindings(
                groups.flatMap(group => group.records),
                bindings.map(binding => binding.value),
            );
            if (discovered.length) {
                groups.push(...(await loadGroupsPages(ref, discovered)));
            }

            dispatch(eventHistoryActions.setInitial({ groups }));
        } catch (error) {
            console.error('loadEventSalesHistory error', error);
            dispatch(eventHistoryActions.setError());
        }
    };

/** Первые страницы указанных привязок одним batch'ем + маппинг записей. */
const loadGroupsPages = async (
    ref: HistoryListRef,
    bindings: HistoryBinding[],
): Promise<
    {
        binding: HistoryBinding;
        records: ReturnType<typeof mapHistoryElement>[];
        next: number | null;
        total: number | null;
    }[]
> => {
    const pages = await historyHelper.getFirstPages(
        ref,
        bindings.map(binding => binding.value),
    );
    return bindings.map(binding => {
        const page = pages.get(binding.value);
        return {
            binding,
            records: (page?.elements ?? []).map(element =>
                mapHistoryElement(element, ref),
            ),
            next: page?.next ?? null,
            total: page?.total ?? null,
        };
    });
};

/** Догрузка одной ленты (скролл дошёл до её конца). */
export const loadMoreHistoryForBinding =
    (bindingValue: string) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const group = state.eventHistory.groups.find(
            item => item.binding.value === bindingValue,
        );
        if (!group || group.isLoadingMore || group.next === null) return;

        const ref = getHistoryListRef(state.portal.portal);
        if (!ref) return;

        dispatch(
            eventHistoryActions.setGroupLoadingMore({
                binding: bindingValue,
                status: true,
            }),
        );
        try {
            const page = await historyHelper.getPage(
                ref,
                bindingValue,
                group.next,
            );
            dispatch(
                eventHistoryActions.setGroupPage({
                    binding: bindingValue,
                    records: page.elements.map(element =>
                        mapHistoryElement(element, ref),
                    ),
                    next: page.next,
                    total: page.total,
                }),
            );
        } catch (error) {
            console.error('loadMoreHistoryForBinding error', error);
            dispatch(
                eventHistoryActions.setGroupLoadingMore({
                    binding: bindingValue,
                    status: false,
                }),
            );
        }
    };
