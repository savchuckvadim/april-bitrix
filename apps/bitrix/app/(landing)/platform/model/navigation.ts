import type { PlatformServiceSlug } from './types';

/** Корень продающего раздела. */
export const PLATFORM_ROOT = '/platform';

/** Якоря главной раздела: ссылки на них стоят в шапке и в тексте. */
export const PLATFORM_ANCHORS = {
    services: 'services',
    launch: 'launch',
    faq: 'faq',
    demo: 'demo',
} as const;

export const platformServiceHref = (slug: PlatformServiceSlug): string =>
    `${PLATFORM_ROOT}/${slug}`;

/**
 * Форма заявки стоит внизу каждой страницы раздела, поэтому ссылка на неё —
 * якорь без пути: с любой страницы ведёт к своей форме, без перехода.
 */
export const PLATFORM_DEMO_HREF = `#${PLATFORM_ANCHORS.demo}`;

export interface PlatformNavLink {
    label: string;
    href: string;
}

/** Разделы главной: в шапке и в мобильном меню под списком сервисов. */
export const PLATFORM_PAGE_LINKS: readonly PlatformNavLink[] = [
    {
        label: 'Как запускаем',
        href: `${PLATFORM_ROOT}#${PLATFORM_ANCHORS.launch}`,
    },
    { label: 'Вопросы', href: `${PLATFORM_ROOT}#${PLATFORM_ANCHORS.faq}` },
];

/**
 * Ссылки шапки рядом с меню «Сервисы»: AI-аналитика вынесена отдельно — это
 * главный довод для собственника. В мобильном меню она уже есть в списке
 * сервисов, поэтому там только PLATFORM_PAGE_LINKS.
 */
export const PLATFORM_HEADER_LINKS: readonly PlatformNavLink[] = [
    { label: 'AI-аналитика', href: platformServiceHref('ai') },
    ...PLATFORM_PAGE_LINKS,
];

/** Юридические и служебные ссылки подвала: страницы уже есть на сайте. */
export const PLATFORM_FOOTER_LINKS: readonly PlatformNavLink[] = [
    { label: 'Поддержка', href: '/support' },
    { label: 'Политика конфиденциальности сайта', href: '/legal/site-privacy' },
    { label: 'Обработка персональных данных', href: '/legal/privacy' },
    { label: 'Лицензионное соглашение', href: '/legal/license' },
];
