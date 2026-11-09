/**
 * Сервисы раздела: реестр, связи между страницами и правила текстов.
 *
 * Правила текстов — от владельца: клиент не видит кодов, жаргона разработки
 * и слова «админка», а раздел не обещает того, чего нет в коде (список
 * UNSUPPORTED_CLAIMS сверен с инвентаризацией 09.11.2026).
 */

import { describe, expect, it } from 'vitest';
import * as hub from '../model/hub';
import { DEMO_FORM_COPY, PLATFORM_COPY } from '../model/copy';
import { findPlatformService, getPlatformServices, PLATFORM_SERVICES } from '../model/services';
import { PLATFORM_SHOTS } from '../model/shots';
import { PLATFORM_SERVICE_SLUGS } from '../model/types';

/** Все строки объекта, на любой глубине. */
const collectStrings = (value: unknown): string[] => {
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value.flatMap(collectStrings);
    if (typeof value === 'object' && value !== null) {
        return Object.values(value).flatMap(collectStrings);
    }
    return [];
};

const CLIENT_TEXTS = collectStrings([
    PLATFORM_SERVICES,
    hub,
    PLATFORM_COPY,
    DEMO_FORM_COPY,
    Object.values(PLATFORM_SHOTS).map(shot => shot.caption),
]);

/** Жаргон и слова, которые клиент видеть не должен. */
const FORBIDDEN_WORDS = ['админк', 'LLM', 'пайплайн', 'конвейер', 'кэш', 'снапшот', 'вебхук', 'хук'];

/** Обещания, которых нет в коде: проверены и сняты при написании раздела. */
const UNSUPPORTED_CLAIMS = [
    'счёт-оферт',
    'сбытов',
    'за 5 минут',
    'без сбоев',
    'полная автоматизация',
    'PDF или Excel',
];

describe('реестр сервисов', () => {
    it('у каждого адреса ровно один сервис, порядок без повторов', () => {
        expect(PLATFORM_SERVICES.map(service => service.slug).sort()).toEqual(
            [...PLATFORM_SERVICE_SLUGS].sort(),
        );
    });

    it('находит сервис по адресу и молчит на чужом', () => {
        expect(findPlatformService('ai')?.name).toBe('AI-аналитика звонков');
        expect(findPlatformService('unknown')).toBeUndefined();
    });

    it('«работает в паре» ведёт на существующие сервисы, не на себя', () => {
        for (const service of PLATFORM_SERVICES) {
            expect(service.related, service.slug).not.toContain(service.slug);
            expect(getPlatformServices(service.related)).toHaveLength(service.related.length);
            expect(new Set(service.related).size, service.slug).toBe(service.related.length);
        }
    });

    it('у каждого сервиса есть выгоды, шаги, возможности и вопросы', () => {
        for (const service of PLATFORM_SERVICES) {
            expect(service.benefits.items.length, service.slug).toBeGreaterThanOrEqual(3);
            expect(service.steps.items.length, service.slug).toBeGreaterThanOrEqual(3);
            expect(service.features.length, service.slug).toBeGreaterThanOrEqual(2);
            expect(service.faq.length, service.slug).toBeGreaterThanOrEqual(2);
        }
    });

    it('мета для поисковиков в разумных пределах', () => {
        for (const service of PLATFORM_SERVICES) {
            expect(service.seo.title.length, service.slug).toBeLessThanOrEqual(80);
            expect(service.seo.description.length, service.slug).toBeLessThanOrEqual(200);
        }
    });
});

describe('тексты для клиента', () => {
    it('без жаргона разработки и «админки»', () => {
        const hits = CLIENT_TEXTS.filter(text =>
            FORBIDDEN_WORDS.some(word => text.toLowerCase().includes(word.toLowerCase())),
        );
        expect(hits).toEqual([]);
    });

    it('без обещаний, которых нет в коде', () => {
        const hits = CLIENT_TEXTS.filter(text =>
            UNSUPPORTED_CLAIMS.some(claim => text.toLowerCase().includes(claim.toLowerCase())),
        );
        expect(hits).toEqual([]);
    });

    it('без восклицательных знаков', () => {
        expect(CLIENT_TEXTS.filter(text => text.includes('!'))).toEqual([]);
    });
});
