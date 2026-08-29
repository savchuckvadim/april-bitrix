import { describe, expect, it } from 'vitest';
import { resolveDeepRoute } from './resolve-deep-route';
import { resolveSideBar } from './resolve-side-bar';
import {
    garantEntities,
    portalAiSettingsEntities,
    portalAppSettingsEntities,
    portalEntities,
    portalGarantEntities,
    portalKeysEntities,
    portalKonstructorEntities,
    portalPbxEntities,
    portalProviderEntities,
    portalQuestionnairesEntities,
} from '../consts/routes.consts';

const PORTAL_ID = '42';

/**
 * Разделы карточки портала со своим боковым меню. Новый раздел добавляется
 * сюда — и сразу проверяется на оба провала: «не выбился из карточки
 * портала» и «не получил своего меню».
 */
const PORTAL_SECTIONS = [
    { section: 'garant', entities: portalGarantEntities },
    { section: 'pbx', entities: portalPbxEntities },
    { section: 'keys', entities: portalKeysEntities },
    { section: 'ai-settings', entities: portalAiSettingsEntities },
    { section: 'app-settings', entities: portalAppSettingsEntities },
    { section: 'questionnaires', entities: portalQuestionnairesEntities },
    { section: 'provider', entities: portalProviderEntities },
    { section: 'konstructor', entities: portalKonstructorEntities },
] as const;

describe('resolveDeepRoute: карточка портала и её разделы', () => {
    it('портал без раздела — это карточка портала', () => {
        const route = resolveDeepRoute(`/portal/${PORTAL_ID}`, PORTAL_ID);

        expect(route.isPortal).toBe(true);
        expect(route.isPortalDetail).toBe(true);
        expect(route.isPortalQuestionnaires).toBe(false);
    });

    it.each(PORTAL_SECTIONS)(
        'раздел «$section» не считается карточкой портала',
        ({ section }) => {
            const route = resolveDeepRoute(
                `/portal/${PORTAL_ID}/${section}`,
                PORTAL_ID,
            );

            expect(route.isPortal).toBe(true);
            expect(route.isPortalDetail).toBe(false);
        },
    );

    it('«Анкеты» поднимают свой флаг и гасят соседние разделы', () => {
        const route = resolveDeepRoute(
            `/portal/${PORTAL_ID}/questionnaires`,
            PORTAL_ID,
        );

        expect(route.isPortalQuestionnaires).toBe(true);
        expect(route.isPortalAppSettings).toBe(false);
        expect(route.isPortalAiSettings).toBe(false);
        expect(route.isPortalKeys).toBe(false);
        expect(route.isPortalPbx).toBe(false);
        expect(route.isPortalProvider).toBe(false);
    });

    it('вложенные экраны раздела остаются в своём разделе', () => {
        const route = resolveDeepRoute(
            `/portal/${PORTAL_ID}/questionnaires/some-id`,
            PORTAL_ID,
        );

        expect(route.isPortalQuestionnaires).toBe(true);
        expect(route.isPortalDetail).toBe(false);
    });

    it('«Анкеты» вне портала разделом портала не считаются', () => {
        const route = resolveDeepRoute('/garant/questionnaires', '');

        expect(route.isPortal).toBe(false);
        expect(route.isPortalQuestionnaires).toBe(false);
        expect(route.isGarant).toBe(true);
    });

    it('список порталов остаётся списком', () => {
        const route = resolveDeepRoute('/portal/list', '');

        expect(route.isPortalList).toBe(true);
        expect(route.isPortalDetail).toBe(false);
        expect(route.isPortalQuestionnaires).toBe(false);
    });

    it('разделы вне портала новый раздел не задевает', () => {
        expect(resolveDeepRoute('/dashboard', '').isDashboard).toBe(true);
        expect(resolveDeepRoute('/client', '').isClient).toBe(true);
        expect(resolveDeepRoute('/marketplace/invites', '').isMarketplace).toBe(
            true,
        );
        expect(
            resolveDeepRoute('/statistics/transcription', '')
                .isStatisticsTranscription,
        ).toBe(true);
        expect(
            resolveDeepRoute(`/portal/${PORTAL_ID}/statistics/ai`, PORTAL_ID)
                .isPortalStatisticsAi,
        ).toBe(true);
    });
});

describe('resolveSideBar: боковое меню разделов портала', () => {
    it.each(PORTAL_SECTIONS)(
        'раздел «$section» получает своё меню, а не дефолт «Гаранта»',
        ({ section, entities }) => {
            const view = resolveSideBar(
                resolveDeepRoute(`/portal/${PORTAL_ID}/${section}`, PORTAL_ID),
            );

            expect(view.currentNavItems).toBe(entities);
            expect(view.currentNavItems).not.toBe(garantEntities);
        },
    );

    it('ссылки «Анкет» строятся от карточки портала', () => {
        const view = resolveSideBar(
            resolveDeepRoute(`/portal/${PORTAL_ID}/questionnaires`, PORTAL_ID),
        );

        expect(view.baseUrl).toBe(`/portal/${PORTAL_ID}`);
        expect(
            `${view.baseUrl}${view.currentNavItems[0]?.item.get.url}`,
        ).toBe(`/portal/${PORTAL_ID}/questionnaires`);
    });

    it('карточка портала по-прежнему показывает меню портала', () => {
        const view = resolveSideBar(
            resolveDeepRoute(`/portal/${PORTAL_ID}`, PORTAL_ID),
        );

        expect(view.currentNavItems).toBe(portalEntities);
        expect(view.baseUrl).toBe(`/portal/${PORTAL_ID}`);
    });
});
