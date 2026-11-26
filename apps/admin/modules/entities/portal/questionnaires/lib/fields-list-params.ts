import type { QuestionnaireFieldsQuery } from '../model';

/**
 * Строка запроса `GET /questionnaire-fields` из параметров экрана.
 *
 * Пустые и умолчательные флаги не передаются: бэк читает их как флаги, и
 * `onlyManual=false` означал бы то же, что его отсутствие, — но плодил бы
 * второй ключ кэша. `withItems` уходит только явным `false`: анкете элементы
 * списков нужны, умолчание бэка — «да».
 */
export const buildFieldsListParams = (
    query: QuestionnaireFieldsQuery,
): QuestionnaireFieldsQuery => ({
    entity: query.entity,
    ...(query.smartId ? { smartId: query.smartId } : {}),
    ...(query.onlyManual ? { onlyManual: true } : {}),
    ...(query.withItems === false ? { withItems: false } : {}),
});
