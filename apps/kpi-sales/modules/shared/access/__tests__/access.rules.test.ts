import { describe, expect, it } from 'vitest';
import { checkAccess } from '../access.rules';
import {
    AccessContext,
    AppFeatureFlags,
    EAccessFeature,
} from '../access.types';

const FEATURES: AppFeatureFlags = {
    financeTab: true,
    plans: true,
    aiAnalytics: true,
    aiAnalyticsPortalEnabled: true,
    aiAnalyticsSelfViewEnabled: false,
};

/** Портал включил показ витрины рядовому менеджеру. */
const SELF_VIEW = { ...FEATURES, aiAnalyticsSelfViewEnabled: true };

const ctx = (overrides: Partial<AccessContext> = {}): AccessContext => ({
    features: FEATURES,
    headOf: null,
    isSuperUser: false,
    isRealSuperUser: false,
    isViewAs: false,
    isMulti: false,
    isSelf: false,
    ...overrides,
});

describe('ACCESS_RULES — AI_TAB', () => {
    it('руководитель любого уровня видит вкладку при обоих флагах', () => {
        expect(
            checkAccess(EAccessFeature.AI_TAB, ctx({ headOf: 'group' })),
        ).toBe(true);
        expect(checkAccess(EAccessFeature.AI_TAB, ctx({ headOf: 'op' }))).toBe(
            true,
        );
        expect(checkAccess(EAccessFeature.AI_TAB, ctx({ headOf: 'cup' }))).toBe(
            true,
        );
    });

    it('суперюзер видит вкладку без роли в структуре', () => {
        expect(
            checkAccess(EAccessFeature.AI_TAB, ctx({ isSuperUser: true })),
        ).toBe(true);
    });

    it('рядовой менеджер без headOf (периметр self) вкладку НЕ видит — только руководители', () => {
        expect(checkAccess(EAccessFeature.AI_TAB, ctx({ isSelf: true }))).toBe(
            false,
        );
    });

    it('«Смотреть как…» рядового менеджера — вкладки нет даже у реального суперюзера', () => {
        expect(
            checkAccess(
                EAccessFeature.AI_TAB,
                ctx({ isSelf: true, isViewAs: true, isRealSuperUser: true }),
            ),
        ).toBe(false);
    });

    // Портальная настройка ai_analytics_self_view_enabled (бэк отдаёт её в
    // settings/get и при выключенной отвечает менеджеру 403): включена —
    // рядовой менеджер видит вкладку со своими данными, но не чужие строки.
    it('self_view включён на портале — рядовой менеджер видит вкладку', () => {
        expect(
            checkAccess(
                EAccessFeature.AI_TAB,
                ctx({ isSelf: true, features: SELF_VIEW }),
            ),
        ).toBe(true);
        expect(
            checkAccess(
                EAccessFeature.AI_VIEW_ALL,
                ctx({ isSelf: true, features: SELF_VIEW }),
            ),
        ).toBe(false);
    });

    it('self_view включён — «Смотреть как…» рядового менеджера показывает то же, что видит он', () => {
        expect(
            checkAccess(
                EAccessFeature.AI_TAB,
                ctx({
                    isSelf: true,
                    isViewAs: true,
                    isRealSuperUser: true,
                    features: SELF_VIEW,
                }),
            ),
        ).toBe(true);
    });

    it('self_view включён, но AI на портале выключен — вкладки нет', () => {
        expect(
            checkAccess(
                EAccessFeature.AI_TAB,
                ctx({
                    isSelf: true,
                    features: { ...SELF_VIEW, aiAnalyticsPortalEnabled: false },
                }),
            ),
        ).toBe(false);
    });

    it('пользователь вне структуры без роли — не видит', () => {
        expect(checkAccess(EAccessFeature.AI_TAB, ctx())).toBe(false);
    });

    it('константа приложения выключена — не видит никто', () => {
        const features = { ...FEATURES, aiAnalytics: false };
        expect(
            checkAccess(
                EAccessFeature.AI_TAB,
                ctx({ features, isSuperUser: true }),
            ),
        ).toBe(false);
    });

    it('портальный флаг выключен (или ещё не пришёл) — не видит никто', () => {
        const features = { ...FEATURES, aiAnalyticsPortalEnabled: false };
        expect(
            checkAccess(
                EAccessFeature.AI_TAB,
                ctx({ features, headOf: 'cup' }),
            ),
        ).toBe(false);
    });
});

describe('ACCESS_RULES — AI_CONFIGURE', () => {
    it('руководитель ОП, вышестоящий и суперюзер настраивают уровни', () => {
        expect(
            checkAccess(EAccessFeature.AI_CONFIGURE, ctx({ headOf: 'op' })),
        ).toBe(true);
        expect(
            checkAccess(EAccessFeature.AI_CONFIGURE, ctx({ headOf: 'cup' })),
        ).toBe(true);
        expect(
            checkAccess(
                EAccessFeature.AI_CONFIGURE,
                ctx({ isSuperUser: true }),
            ),
        ).toBe(true);
    });

    it('руководитель группы и рядовой менеджер — нет', () => {
        expect(
            checkAccess(EAccessFeature.AI_CONFIGURE, ctx({ headOf: 'group' })),
        ).toBe(false);
        expect(
            checkAccess(EAccessFeature.AI_CONFIGURE, ctx({ isSelf: true })),
        ).toBe(false);
    });

    it('без портального флага — нет даже суперюзеру', () => {
        const features = { ...FEATURES, aiAnalyticsPortalEnabled: false };
        expect(
            checkAccess(
                EAccessFeature.AI_CONFIGURE,
                ctx({ features, isSuperUser: true }),
            ),
        ).toBe(false);
    });
});

describe('ACCESS_RULES — AI_VIEW_ALL', () => {
    it('руководитель и суперюзер видят всех', () => {
        expect(
            checkAccess(EAccessFeature.AI_VIEW_ALL, ctx({ headOf: 'group' })),
        ).toBe(true);
        expect(
            checkAccess(EAccessFeature.AI_VIEW_ALL, ctx({ isSuperUser: true })),
        ).toBe(true);
    });

    it('рядовой менеджер не видит всех, даже с периметром self', () => {
        expect(
            checkAccess(EAccessFeature.AI_VIEW_ALL, ctx({ isSelf: true })),
        ).toBe(false);
    });

    it('без портального флага — нет', () => {
        const features = { ...FEATURES, aiAnalyticsPortalEnabled: false };
        expect(
            checkAccess(
                EAccessFeature.AI_VIEW_ALL,
                ctx({ features, headOf: 'op' }),
            ),
        ).toBe(false);
    });
});

describe('ACCESS_RULES — AI_CALL_REVIEWS («Разборы звонков»)', () => {
    it('руководитель любого уровня и суперпользователь видят раздел', () => {
        for (const headOf of ['group', 'op', 'cup'] as const) {
            expect(checkAccess(EAccessFeature.AI_CALL_REVIEWS, ctx({ headOf }))).toBe(true);
        }
        expect(
            checkAccess(
                EAccessFeature.AI_CALL_REVIEWS,
                ctx({ isSuperUser: true, isRealSuperUser: true }),
            ),
        ).toBe(true);
    });

    it('рядовой менеджер раздела не видит, даже если ему открыта витрина', () => {
        expect(
            checkAccess(
                EAccessFeature.AI_CALL_REVIEWS,
                ctx({ isSelf: true, features: SELF_VIEW }),
            ),
        ).toBe(false);
    });

    it('суперпользователь в «Смотреть как…» менеджера раздел видит — оценивает от своего имени', () => {
        expect(
            checkAccess(
                EAccessFeature.AI_CALL_REVIEWS,
                ctx({ isSelf: true, isViewAs: true, isRealSuperUser: true }),
            ),
        ).toBe(true);
    });

    it('AI-аналитика выключена на портале — раздела нет', () => {
        expect(
            checkAccess(
                EAccessFeature.AI_CALL_REVIEWS,
                ctx({
                    headOf: 'op',
                    features: { ...FEATURES, aiAnalyticsPortalEnabled: false },
                }),
            ),
        ).toBe(false);
    });
});

describe('ACCESS_RULES — AI_DEAL_MOVEMENT («Движение сделок»)', () => {
    const can = (overrides: Partial<AccessContext>): boolean =>
        checkAccess(EAccessFeature.AI_DEAL_MOVEMENT, ctx(overrides));

    it('руководитель любого уровня и суперпользователь видят подвкладку', () => {
        for (const headOf of ['group', 'op', 'cup'] as const) {
            expect(can({ headOf })).toBe(true);
        }
        expect(can({ isSuperUser: true, isRealSuperUser: true })).toBe(true);
    });

    it('рядовой менеджер не видит, даже если ему открыта витрина', () => {
        expect(can({ isSelf: true, features: SELF_VIEW })).toBe(false);
    });

    it('суперпользователь в «Смотреть как…» менеджера не видит — данные спрашиваются от менеджера', () => {
        expect(
            can({ isSelf: true, isViewAs: true, isRealSuperUser: true }),
        ).toBe(false);
    });

    it('AI-аналитика выключена в приложении или на портале — подвкладки нет', () => {
        expect(
            can({
                headOf: 'op',
                features: { ...FEATURES, aiAnalyticsPortalEnabled: false },
            }),
        ).toBe(false);
        expect(
            can({ headOf: 'op', features: { ...FEATURES, aiAnalytics: false } }),
        ).toBe(false);
    });
});
