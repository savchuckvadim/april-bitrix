import type { Tone } from '@workspace/april-ui';
import { CallResults } from '@/modules/features/NoCall';

/**
 * Конфигурация бэйджей статистики (данные отдельно от UI).
 *
 * Тоны — из единого реестра april-ui; рисуются soft-вариантом: пять сплошных
 * заливок в шапке складывались в «светофор», в котором тонул сам список дел.
 */
export const RESULT_BADGES: Array<{
    key: keyof CallResults;
    label: string;
    tone: Tone;
}> = [
    { key: 'resultCount', label: 'результативных', tone: 'success' },
    { key: 'noresultCount', label: 'недозвонов', tone: 'warning' },
    { key: 'presentationCount', label: 'презентаций', tone: 'event-pres' },
    { key: 'inProgressCount', label: 'в работе', tone: 'event-hot' },
    { key: 'inMoneyCount', label: 'оплата', tone: 'event-money' },
];
