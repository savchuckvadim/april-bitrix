import type { PlatformShotId } from './platform-shots';

/**
 * Страницы раздела /platform для группировки мест кадров в админке.
 *
 * Страница кадра — по префиксу id (`calls-form` → «Звонки»): так названы
 * все кадры реестра. Названия и адреса совпадают со страницами сайта —
 * это сверяет тест apps/bitrix (__tests__/shots.test.ts).
 */
export interface PlatformShotPage {
    /** Префикс id кадров этой страницы. */
    prefix: string;
    title: string;
    path: string;
}

export const PLATFORM_SHOT_PAGES: readonly PlatformShotPage[] = [
    { prefix: 'hub', title: 'Главная раздела', path: '/platform' },
    { prefix: 'calls', title: 'Звонки', path: '/platform/calls' },
    { prefix: 'docs', title: 'Конструктор документов', path: '/platform/documents' },
    { prefix: 'kpi', title: 'KPI-отчёт', path: '/platform/kpi' },
    { prefix: 'ai', title: 'AI-аналитика звонков', path: '/platform/ai' },
    { prefix: 'leads', title: 'Заявки и сигналы', path: '/platform/leads' },
    { prefix: 'funnels', title: 'Воронки', path: '/platform/funnels' },
    { prefix: 'automation', title: 'Массовые операции', path: '/platform/automation' },
    { prefix: 'site', title: 'Сайт в подарок', path: '/platform/site' },
];

/** Страница, где стоит кадр; undefined — id не по соглашению (ловит тест). */
export const platformShotPage = (id: PlatformShotId): PlatformShotPage | undefined =>
    PLATFORM_SHOT_PAGES.find(page => id.startsWith(`${page.prefix}-`));
