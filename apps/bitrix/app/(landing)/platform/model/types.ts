/**
 * Модель продающего раздела /platform.
 *
 * Тексты живут в данных, вёрстка их только рендерит: формулировки правятся
 * чаще разметки, и к ним возвращается владелец, а не разработчик.
 *
 * Правило раздела: каждый блок начинается с выгоды клиента, а функция идёт
 * доказательством. Поэтому у карточек поле `title` — выгода («Документы без
 * ошибок в комплектах»), а `text` — как именно это достигается.
 */

import type { PlatformShotId } from './shots';

/** Адреса страниц сервисов: /platform/<slug>. */
export const PLATFORM_SERVICE_SLUGS = [
    'calls',
    'documents',
    'kpi',
    'ai',
    'leads',
    'funnels',
    'automation',
    'site',
] as const;

export type PlatformServiceSlug = (typeof PLATFORM_SERVICE_SLUGS)[number];

/** Карточка «выгода → как достигается». */
export interface PlatformBenefit {
    title: string;
    text: string;
}

/** Шаг «как это работает»; при шаге может стоять кадр. */
export interface PlatformStep {
    title: string;
    text: string;
    shotId?: PlatformShotId;
}

/** Группа возможностей сервиса: полное описание для тех, кто вчитывается. */
export interface PlatformFeatureGroup {
    title: string;
    items: readonly string[];
}

/** Что получает конкретная роль: менеджер, руководитель, собственник. */
export interface PlatformRoleValue {
    role: string;
    title: string;
    items: readonly string[];
}

export interface PlatformFaqItem {
    question: string;
    answer: string;
}

/** Мета страницы для поисковиков и превью ссылки в мессенджерах. */
export interface PlatformSeo {
    title: string;
    description: string;
}

export interface PlatformService {
    slug: PlatformServiceSlug;
    /** Короткое имя сервиса: меню, хлебные крошки, подпись над заголовком. */
    name: string;
    /** Карточка на главной раздела: выгода и одна строка доказательства. */
    card: PlatformBenefit;
    hero: {
        title: string;
        lead: string;
        shotId?: PlatformShotId;
    };
    benefits: {
        title: string;
        items: readonly PlatformBenefit[];
    };
    steps: {
        title: string;
        items: readonly PlatformStep[];
    };
    features: readonly PlatformFeatureGroup[];
    roles?: readonly PlatformRoleValue[];
    /** Кадры, которые не встали в шаги: показываются галереей. */
    gallery: readonly PlatformShotId[];
    faq: readonly PlatformFaqItem[];
    /** С чем сервис работает в паре: ссылки внизу страницы. */
    related: readonly PlatformServiceSlug[];
    seo: PlatformSeo;
}
