import { describe, expect, it } from 'vitest';
import { checkAccess } from '../access.rules';
import {
    AccessContext,
    AppFeatureFlags,
    EAccessFeature,
} from '../access.types';

/*
 * Правила, завязанные на суперпользователя вендора (флаг бэка
 * currentUser.isSuperUser): VIEW_AS — реальный, SHARE_LINKS и
 * FINANCE_TAB — эффективный (в viewAs гасится).
 */

const FEATURES: AppFeatureFlags = {
    financeTab: true,
    plans: true,
    aiAnalytics: true,
    aiAnalyticsPortalEnabled: true,
    aiAnalyticsSelfViewEnabled: false,
};

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

/** Реальный суперпользователь без viewAs. */
const SUPER = { isSuperUser: true, isRealSuperUser: true };
/** Реальный суперпользователь смотрит как рядовой менеджер. */
const SUPER_VIEW_AS = {
    isSuperUser: false,
    isRealSuperUser: true,
    isViewAs: true,
    isSelf: true,
};

describe('ACCESS_RULES — VIEW_AS', () => {
    it('реальный суперпользователь — да, и внутри режима (чтобы выйти)', () => {
        expect(checkAccess(EAccessFeature.VIEW_AS, ctx(SUPER))).toBe(true);
        expect(checkAccess(EAccessFeature.VIEW_AS, ctx(SUPER_VIEW_AS))).toBe(
            true,
        );
    });

    it('руководитель портала без флага — нет', () => {
        expect(checkAccess(EAccessFeature.VIEW_AS, ctx({ headOf: 'cup' }))).toBe(
            false,
        );
    });
});

describe('ACCESS_RULES — SHARE_LINKS', () => {
    it('суперпользователь — да; в viewAs — нет', () => {
        expect(checkAccess(EAccessFeature.SHARE_LINKS, ctx(SUPER))).toBe(true);
        expect(
            checkAccess(EAccessFeature.SHARE_LINKS, ctx(SUPER_VIEW_AS)),
        ).toBe(false);
    });

    it('руководители пока нет (обкатка у суперпользователя)', () => {
        expect(
            checkAccess(EAccessFeature.SHARE_LINKS, ctx({ headOf: 'cup' })),
        ).toBe(false);
    });
});

describe('ACCESS_RULES — FINANCE_TAB', () => {
    it('суперпользователь — да; в viewAs менеджера — нет', () => {
        expect(checkAccess(EAccessFeature.FINANCE_TAB, ctx(SUPER))).toBe(true);
        expect(
            checkAccess(EAccessFeature.FINANCE_TAB, ctx(SUPER_VIEW_AS)),
        ).toBe(false);
    });

    it('op и cup — да; group и без роли — нет', () => {
        expect(
            checkAccess(EAccessFeature.FINANCE_TAB, ctx({ headOf: 'op' })),
        ).toBe(true);
        expect(
            checkAccess(EAccessFeature.FINANCE_TAB, ctx({ headOf: 'cup' })),
        ).toBe(true);
        expect(
            checkAccess(EAccessFeature.FINANCE_TAB, ctx({ headOf: 'group' })),
        ).toBe(false);
        expect(checkAccess(EAccessFeature.FINANCE_TAB, ctx())).toBe(false);
    });

    it('публичная страница: снимок суперпользователя без роли — нет', () => {
        // /share: флага в app нет, роль в снимке сброшена toShareCurrentUser.
        expect(
            checkAccess(
                EAccessFeature.FINANCE_TAB,
                ctx({ headOf: null, isSelf: true }),
            ),
        ).toBe(false);
    });

    it('флаг приложения выключен — нет даже суперпользователю', () => {
        expect(
            checkAccess(
                EAccessFeature.FINANCE_TAB,
                ctx({ ...SUPER, features: { ...FEATURES, financeTab: false } }),
            ),
        ).toBe(false);
    });
});
