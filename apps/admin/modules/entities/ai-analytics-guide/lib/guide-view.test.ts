import { describe, expect, it } from 'vitest';
import type { GuideParam, GuideSectionItem } from '../model';
import {
    buildGuideSectionHref,
    buildSwaggerHint,
    fillDomain,
    formatParamDefault,
    formatParamRange,
    groupGuideParams,
    parseGuidePortalId,
    resolveGuideHref,
    resolveSectionCode,
} from './guide-view';

const item = (code: string): GuideSectionItem => ({
    code,
    title: code,
    summary: '',
    settingsCount: 0,
    portalAiSettingsCount: 0,
    paramsCount: 0,
    knowledgeKindsCount: 0,
    endpointsCount: 0,
    hasLaunch: false,
});

const param = (code: string, group: string): GuideParam => ({
    code,
    title: code,
    userTitle: null,
    description: '',
    scope: 'portal',
    source: 'configured',
    unit: '',
    default: 1 as unknown as GuideParam['default'],
    range: null,
    phase: 1,
    breaksSeries: false,
    group,
    groupTitle: `Группа ${group}`,
    note: null,
});

describe('resolveGuideHref', () => {
    it('подставляет id портала в ссылку карточки', () => {
        expect(
            resolveGuideHref('/portal/{portalId}/app-settings#setting-x', 7),
        ).toBe('/portal/7/app-settings#setting-x');
    });

    it('без портала ссылка карточки недоступна, глобальная — как есть', () => {
        expect(resolveGuideHref('/portal/{portalId}/ai-settings', undefined)).toBeNull();
        expect(resolveGuideHref('/ai-analytics/model', undefined)).toBe('/ai-analytics/model');
    });
});

describe('buildGuideSectionHref', () => {
    it('раздел — якорем, портал — параметром адреса', () => {
        expect(buildGuideSectionHref('forecast')).toBe('/ai-analytics/guide#forecast');
        expect(buildGuideSectionHref('forecast', 7)).toBe(
            '/ai-analytics/guide?portalId=7#forecast',
        );
    });
});

describe('resolveSectionCode', () => {
    const items = [item('a'), item('b')];

    it('известный якорь выбирает раздел, пустой или чужой — первый', () => {
        expect(resolveSectionCode('#b', items)).toBe('b');
        expect(resolveSectionCode('', items)).toBe('a');
        expect(resolveSectionCode('#nope', items)).toBe('a');
        expect(resolveSectionCode('#a', [])).toBeUndefined();
    });
});

describe('parseGuidePortalId', () => {
    it('число — портал, мусор и ноль — нет', () => {
        expect(parseGuidePortalId('12')).toBe(12);
        expect(parseGuidePortalId('0')).toBeUndefined();
        expect(parseGuidePortalId('abc')).toBeUndefined();
        expect(parseGuidePortalId(null)).toBeUndefined();
    });
});

describe('fillDomain', () => {
    it('подставляет домен во все вхождения, без домена оставляет плейсхолдер', () => {
        expect(fillDomain('{"domain":"{domain}"}', 'x.bitrix24.ru')).toBe(
            '{"domain":"x.bitrix24.ru"}',
        );
        expect(fillDomain('domain={domain}', undefined)).toBe('domain={domain}');
    });
});

describe('formatParamDefault / formatParamRange', () => {
    it('флаг — вкл/выкл, пустая строка — «пусто», объект — JSON', () => {
        expect(formatParamDefault(true)).toBe('вкл');
        expect(formatParamDefault(false)).toBe('выкл');
        expect(formatParamDefault(0.5)).toBe('0.5');
        expect(formatParamDefault('')).toBe('«пусто»');
        expect(formatParamDefault({ a: 1 })).toBe('{"a":1}');
        expect(formatParamDefault(null)).toBe('—');
    });

    it('диапазон — [min; max], без него — прочерк', () => {
        expect(formatParamRange([3, 7])).toBe('[3; 7]');
        expect(formatParamRange(null)).toBe('—');
        expect(formatParamRange(undefined)).toBe('—');
    });
});

describe('groupGuideParams', () => {
    it('группирует по тематике в порядке первого появления', () => {
        const groups = groupGuideParams([
            param('a', 'thresholds'),
            param('b', 'policy'),
            param('c', 'thresholds'),
        ]);
        expect(groups.map(group => group.group)).toEqual(['thresholds', 'policy']);
        expect(groups[0]?.params.map(p => p.code)).toEqual(['a', 'c']);
        expect(groups[0]?.groupTitle).toBe('Группа thresholds');
    });
});

describe('buildSwaggerHint', () => {
    it('называет приложение, путь Swagger и ручку', () => {
        expect(
            buildSwaggerHint({
                app: 'kpi-report-sales',
                method: 'POST',
                path: 'ai-analytics/cache/reset',
                swaggerPath: '/docs/api',
            }),
        ).toBe('Swagger kpi-report-sales: /docs/api → POST /api/ai-analytics/cache/reset');
    });
});
