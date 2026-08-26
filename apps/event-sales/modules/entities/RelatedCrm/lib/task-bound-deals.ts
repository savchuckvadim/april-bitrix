import { getTaskLinks } from '@/modules/entities/EventTask/lib/task-links';
import type { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import type { RelatedDeal } from '../model';

/**
 * Загруженные сделки привязок задач клиента (`UF_CRM_TASK: D_<id>`).
 *
 * Слайс taskDeals наполняется листенером на setFetchedTasks ровно по этим же
 * привязкам, поэтому здесь только сопоставление id → сделка — чистая функция
 * без запросов. Id, по которым сделка ещё не приехала (или закрыта и потому
 * не грузилась), молча пропускаются: полоска появится со следующим ответом.
 *
 * Зачем это шапке: у лид-клиента без компании граф связей (duplicates/details)
 * сделку «нового стиля» не находит — она создана без стандартного LEAD_ID,
 * и единственная ниточка к ней — привязка в задаче звонка.
 */
export const collectTaskBoundDeals = (
    tasks: ReadonlyArray<EventTask | null | undefined>,
    dealsById: Record<number, RelatedDeal>,
): RelatedDeal[] => {
    const seen = new Set<number>();
    const result: RelatedDeal[] = [];
    for (const task of tasks) {
        if (!task) continue;
        for (const id of getTaskLinks(task).dealIds) {
            if (seen.has(id)) continue;
            seen.add(id);
            const deal = dealsById[id];
            if (deal) result.push(deal);
        }
    }
    return result;
};
