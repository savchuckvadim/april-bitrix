/** Пункты навигации раздела «Как мы работаем» (порядок = порядок в меню). */
export interface HowNavItem {
    slug: string;
    label: string;
}

export const HOW_BASE_PATH = '/how-we-work';

export const HOW_NAV_ITEMS: HowNavItem[] = [
    { slug: '', label: 'Обзор' },
    { slug: 'philosophy', label: 'Наш подход' },
    { slug: 'process', label: 'Процесс продажи' },
    { slug: 'manager', label: 'Менеджеру' },
    { slug: 'analytics', label: 'Руководителю' },
    { slug: 'inbound', label: 'Входящий поток' },
    { slug: 'fields', label: 'Автозаполнение' },
    { slug: 'implementation', label: 'Внедрение' },
    { slug: 'ai', label: 'ИИ-анализ' },
];

export const howPath = (slug: string): string =>
    slug ? `${HOW_BASE_PATH}/${slug}` : HOW_BASE_PATH;
