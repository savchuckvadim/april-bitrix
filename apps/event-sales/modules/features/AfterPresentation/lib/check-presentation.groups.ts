import type { CheckPresentationItem } from '../type/check-presentation-type';

/**
 * Раскладка опросника по колонкам и категориям «Пяти К».
 *
 * Категория живёт ТОЛЬКО в отображении. В данных title намеренно остаётся с
 * префиксом («КЛИЕНТ: Что хочет?») — он уходит в сводку op_presentation_5k на
 * портал (CheckPresentationPersistThunk) и в текст комментария события:
 * там разметка категорий нужна, а поля group у портального вопроса нет.
 */

const FIVE_K_PREFIX = 'op_5k_';

/** Вопрос «Пяти К» — правая колонка окна. */
export const isFiveKCode = (code: string): boolean =>
    code.startsWith(FIVE_K_PREFIX);

/** Сегмент кода → русское имя категории. Порядок = порядок групп в окне. */
const FIVE_K_GROUP_BY_SEGMENT: Record<string, string> = {
    client: 'Клиент',
    company: 'Компания',
    command: 'Коллеги',
    concurent: 'Конкурент',
    criteri: 'Критерий выбора',
};

/** Категория вопроса «Пяти К» из кода поля; не 5К — null. */
export const getFiveKGroup = (code: string): string | null => {
    if (!isFiveKCode(code)) return null;
    const segment = code.slice(FIVE_K_PREFIX.length).split('_')[0] ?? '';
    return FIVE_K_GROUP_BY_SEGMENT[segment] ?? null;
};

/**
 * Заголовок для лейбла: у вопросов 5К префикс категории срезается — категорию
 * показывает полоса-разделитель группы, дублировать её в каждом лейбле шумно.
 */
export const getDisplayTitle = (item: CheckPresentationItem): string => {
    if (!isFiveKCode(item.code)) return item.title;
    return item.title.replace(/^[^:]+:\s*/, '');
};
