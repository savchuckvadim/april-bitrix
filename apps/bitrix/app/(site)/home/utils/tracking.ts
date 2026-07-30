/**
 * Утилиты для отслеживания источника перехода на форму
 */

export type LeadSource =
    | 'hero_video'
    | 'commercial_proposal'
    | 'hero'
    | 'solution'
    | 'manager_benefits'
    | 'documents'
    | 'calls'
    | 'kpi'
    | 'pricing'
    | 'header'
    | 'navigation'
    | 'scroll'; // Автоматически определено при скролле

const SOURCE_STORAGE_KEY = 'lead_form_source';
const SOURCE_TIMESTAMP_KEY = 'lead_form_source_timestamp';

/**
 * Сохраняет источник перехода на форму
 */
export const setLeadSource = (source: LeadSource): void => {
    if (typeof window === 'undefined') return;

    try {
        sessionStorage.setItem(SOURCE_STORAGE_KEY, source);
        sessionStorage.setItem(SOURCE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
        console.error('Error saving lead source:', error);
    }
};

/**
 * Получает сохраненный источник перехода
 */
export const getLeadSource = (): LeadSource | null => {
    if (typeof window === 'undefined') return null;

    try {
        const source = sessionStorage.getItem(SOURCE_STORAGE_KEY);
        const timestamp = sessionStorage.getItem(SOURCE_TIMESTAMP_KEY);

        // Источник действителен в течение 30 минут
        if (source && timestamp) {
            const age = Date.now() - parseInt(timestamp, 10);
            if (age < 30 * 60 * 1000) { // 30 минут
                return source as LeadSource;
            }
        }

        return null;
    } catch (error) {
        console.error('Error reading lead source:', error);
        return null;
    }
};

/**
 * Очищает сохраненный источник
 */
export const clearLeadSource = (): void => {
    if (typeof window === 'undefined') return;

    try {
        sessionStorage.removeItem(SOURCE_STORAGE_KEY);
        sessionStorage.removeItem(SOURCE_TIMESTAMP_KEY);
    } catch (error) {
        console.error('Error clearing lead source:', error);
    }
};

/**
 * Расширенная функция скролла с сохранением источника
 */
export const scrollToSectionWithSource = (
    href: string,
    source: LeadSource
): void => {
    setLeadSource(source);
    const element = document.querySelector(href);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Обновляем URL с хэшем для работы кнопки "Назад"
        const sectionId = href.substring(1);
        if (typeof window !== 'undefined' && window.history.pushState) {
            const newUrl = sectionId === 'hero'
                ? window.location.pathname
                : `${window.location.pathname}${href}`;
            window.history.pushState(null, '', newUrl);
        }
    }
};

