/**
 * Битрикс-сущности для сервисов флоу — замена импортов `@/modules/bitrix`
 * бэка (санкционированный шов А1: типы объявляются локально по фактическому
 * использованию).
 *
 * Все декларации живут в `../shared/bitrix/bitrix.interface` (локальные
 * копии 1:1 с back/libs/bitrix, источники перечислены в его шапке) — здесь
 * только реэкспорт под путём, которым пользуются зеркала services/*: у
 * каждой декларации ОДИН дом, а у сервисов — короткий путь в types/.
 */
export {
    EBXTaskMark,
    EBXTaskStatus,
    type IBXCompany,
    type IBXContact,
    type IBXDeal,
    type IBXPlacement,
    type IBXPlacementOptions,
    type IBXTask,
    type IBXUser,
} from '../shared/bitrix/bitrix.interface';
// Богатый вариант — ровно тот, что видят context/init на бэке через
// баррель '@/modules/bitrix' (см. шапку bx-lead.interface.ts).
export type { IBXLead } from '../shared/bitrix/bx-lead.interface';
