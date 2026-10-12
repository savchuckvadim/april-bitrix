/**
 * Путь раздела в ГЛОБАЛЬНОМ дереве админки. Портальный путь собирается из
 * `basePath`, который передаёт страница: один модуль обслуживает оба дерева.
 */
export const SUPPLY_REPORT_TEMPLATE_PATH = '/konstructor/supply-report-template';

/**
 * Базовый URL эндпоинтов на konstructor-бэке.
 *
 * Префикс `/api` — глобальный (`bootstrapApp` ставит
 * `setGlobalPrefix('api')`), сам контроллер объявлен как
 * `@Controller('supply-report-templates')`. Так же выглядят все уже
 * сгенерированные клиенты: `/api/word-templates`, `/api/invoice-templates`.
 */
export const SUPPLY_REPORT_TEMPLATE_API_BASE = '/api/supply-report-templates';

export const SUPPLY_REPORT_TEMPLATE_LIST_CASH_KEY = 'supply-report-templates';
export const SUPPLY_REPORT_TEMPLATE_ITEM_CASH_KEY = 'supply-report-template';
