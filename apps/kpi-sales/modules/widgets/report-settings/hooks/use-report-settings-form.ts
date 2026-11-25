'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/modules/app';
import {
    loadPortalView,
    portalViewActions,
    savePortalView,
    useCanEditPortalView,
    usePortalView,
    type PortalViewBadgeOption,
} from '@/modules/feature/portal-view';
import {
    buildSaveBody,
    canTurnBadgeOff,
    formFromView,
    isFormDirty,
    resetBadgesToDefault,
    setBadgeMain,
    setChartsEnabled,
    setTabVisible,
    type ReportSettingsForm,
} from '../lib/report-settings-form';

const NO_BADGES: readonly PortalViewBadgeOption[] = [];

/**
 * Состояние страницы настроек: форма поверх сохранённых настроек портала,
 * признак «есть что сохранять», сохранение и повторная загрузка. Когда
 * настройки в сторе меняются (загрузка, успешное сохранение), форма
 * начинается заново с них — ответ бэка главнее черновика.
 */
export const useReportSettingsForm = () => {
    const dispatch = useAppDispatch();
    const portal = usePortalView();
    const canEdit = useCanEditPortalView();
    const badges = portal.options?.badges ?? NO_BADGES;

    const [form, setForm] = useState<ReportSettingsForm>(() => formFromView(portal.view));
    const [syncedView, setSyncedView] = useState(portal.view);
    const [saved, setSaved] = useState(false);

    if (syncedView !== portal.view) {
        setSyncedView(portal.view);
        setForm(formFromView(portal.view));
    }

    const change = (next: ReportSettingsForm) => {
        setForm(next);
        setSaved(false);
        if (portal.error) dispatch(portalViewActions.clearError());
    };

    const save = async () => {
        const ok = await dispatch(savePortalView(buildSaveBody(portal.view, form, badges)));
        setSaved(ok);
    };

    return {
        portal,
        canEdit,
        form,
        saved,
        dirty: isFormDirty(portal.view, form, badges),
        setTabVisible: (code: string, visible: boolean) =>
            change(setTabVisible(form, code, visible)),
        setChartsEnabled: (enabled: boolean) => change(setChartsEnabled(form, enabled)),
        setBadgeMain: (id: string, on: boolean) => change(setBadgeMain(form, badges, id, on)),
        canTurnBadgeOff: (id: string) => canTurnBadgeOff(form, badges, id),
        resetBadges: () => change(resetBadgesToDefault(form)),
        save,
        retryLoad: () => dispatch(loadPortalView()),
    };
};
