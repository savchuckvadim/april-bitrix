import { CALLS_LIST_PATH } from '@/modules/entities/calls-list/lib/calls-list.const';

/**
 * Каркас страницы по адресу:
 * - `public` — публичные страницы (`/share/…` — снимок отчёта, `/call/…` —
 *   разбор звонка): без Bitrix-инициализации и каркаса отчёта, данные
 *   приходят готовыми;
 * - `bare` — страницы приложения на всю ширину без обвязки отчёта
 *   («Разборы звонков» `/calls`): инициализация приложения (сессия портала,
 *   пользователь) есть, шапки, фильтров и вкладок отчёта нет;
 * - `report` — всё остальное: приложение и каркас отчёта.
 */
export type AppLayoutKind = 'public' | 'bare' | 'report';

const PUBLIC_PREFIXES = ['/share', '/call/'] as const;
const BARE_PATHS = [CALLS_LIST_PATH] as const;

const isUnder = (pathname: string, path: string): boolean =>
    pathname === path || pathname.startsWith(`${path}/`);

export function appLayoutKind(pathname: string | null | undefined): AppLayoutKind {
    if (!pathname) return 'report';
    if (PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) return 'public';
    return BARE_PATHS.some(path => isUnder(pathname, path)) ? 'bare' : 'report';
}

/**
 * Можно ли запускать цепочку загрузки отчёта (сохранённый фильтр → расчёт
 * отчёта и статистики звонков). Только на страницах отчёта: на «Разборах
 * звонков» отчёт не нужен, а его расчёт — тяжёлый для сервера. Структура
 * отделов, сессия и пользователь грузятся всегда — от них права.
 */
export const isReportChainAllowed = (kind: AppLayoutKind): boolean =>
    kind === 'report';
