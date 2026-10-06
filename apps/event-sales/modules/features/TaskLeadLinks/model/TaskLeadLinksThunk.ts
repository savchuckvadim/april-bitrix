import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
// Прямые пути, а не барели сущностей: те тянут за собой UI.
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan/type/event-plan-type';
import { ensureRelatedDetails } from '@/modules/entities/RelatedCrm/model/RelatedCrmThunk';
import type { RelatedCrmDetails } from '@/modules/entities/RelatedCrm/model';
import {
    buildTaskLeadLinksView,
    needsLeadLinkDefault,
    pickDefaultLeadIds,
} from '../lib/task-lead-links';
import { taskLeadLinksActions } from './TaskLeadLinksSlice';

/**
 * Сколько отправка готова ждать связи клиента ради привязки заявки.
 * Обычно ждать нечего: связи запрашивает сам блок выбора при открытии дела
 * (useTaskLeadLinks). Потолок — на случай, когда ответ ещё в пути: отчёт
 * важнее привязки, держать кнопку «Отправить» дольше нельзя.
 */
const LEAD_LINKS_WAIT_MS = 3000;

const withDeadline = <T>(
    promise: Promise<T>,
    timeoutMs: number,
): Promise<T | null> =>
    new Promise(resolve => {
        const timer = setTimeout(() => resolve(null), timeoutMs);
        promise.then(
            value => {
                clearTimeout(timer);
                resolve(value);
            },
            () => {
                clearTimeout(timer);
                resolve(null);
            },
        );
    });

/**
 * Страховка перед отправкой: у новой задачи должна быть заявка, если она
 * у клиента есть.
 *
 * Связи клиента больше не грузятся на каждое открытие фрейма (облегчённый
 * бут, 05.10.2026), а предвыбор заявки ставил блок «связать с заявками»
 * уже по загруженным связям. Если менеджер отправил отчёт раньше, чем
 * связи приехали, набор оставался пустым — и путь заявки обрывался молча.
 * Здесь связи дозапрашиваются (или дожидаются) и ставится тот же
 * предвыбор, что поставил бы блок: самая свежая заявка, иначе самый
 * свежий открытый лид.
 *
 * Ничего не нашлось или не дождались — отчёт уходит без привязки, как и
 * раньше при недоступных связях.
 */
export const ensureTaskLeadLinks =
    () =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
        const state = getState();
        const currentTask = state.eventTask.current;
        const planActive = state.eventPlan[EV_PLAN_PROP.IS_ACTIVE];
        const { isTouched, selectedIds } = state.taskLeadLinks;
        if (
            !needsLeadLinkDefault({
                currentTask,
                planActive,
                isTouched,
                selectedIds,
            })
        ) {
            return;
        }

        const related = await withDeadline<RelatedCrmDetails | null>(
            dispatch(ensureRelatedDetails()),
            LEAD_LINKS_WAIT_MS,
        );
        if (!related) return;

        const { candidates } = buildTaskLeadLinksView({
            currentTask,
            planActive,
            leads: related.leads,
        });
        const defaults = pickDefaultLeadIds(candidates);
        if (defaults.length) {
            dispatch(taskLeadLinksActions.preselect(defaults));
        }
    };
