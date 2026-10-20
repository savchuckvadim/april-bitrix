'use client';

import type { AiSettingsForm } from '../../hooks/use-ai-settings-form';
import type { AiSettingsTab } from '../../lib/ai-settings-form.util';
import { AiSettingsLevelsTab } from './AiSettingsLevelsTab';
import { AiSettingsTargetsTab } from './AiSettingsTargetsTab';
import { AiSettingsAbsencesTab } from './AiSettingsAbsencesTab';
import { AiSettingsRosterTab } from './AiSettingsRosterTab';
import { AiSettingsHypothesisTab } from './AiSettingsHypothesisTab';
import { AiSettingsPoolTab } from './AiSettingsPoolTab';

interface AiSettingsSectionBodyProps {
    tab: AiSettingsTab;
    form: AiSettingsForm;
}

/**
 * Поля одной секции настроек витрины по её ключу — общая часть вкладок
 * диалога и раскрытых секций на подвкладках «Сотрудники» и «Настройки
 * витрины».
 */
export const AiSettingsSectionBody = ({ tab, form }: AiSettingsSectionBodyProps) => {
    switch (tab) {
        case 'levels':
            return (
                <AiSettingsLevelsTab
                    rows={form.form.levels}
                    errors={form.errors.levels}
                    disabled={form.disabled}
                    onLevel={form.setLevel}
                    onSince={form.setSince}
                />
            );
        case 'targets':
            return (
                <AiSettingsTargetsTab
                    rows={form.form.targets}
                    overrides={form.form.overrides}
                    errors={form.errors.targets}
                    disabled={form.disabled}
                    onChange={form.setTarget}
                />
            );
        case 'absences':
            return (
                <AiSettingsAbsencesTab
                    rows={form.form.absences}
                    errors={form.errors.absences}
                    managers={form.managerOptions}
                    disabled={form.disabled}
                    onAdd={form.addAbsence}
                    onChange={form.patchAbsence}
                    onRemove={form.removeAbsence}
                />
            );
        case 'roster':
            return (
                <AiSettingsRosterTab
                    loaded={form.settingsLoaded}
                    current={form.form.rosterConfirmedAt}
                    pending={form.form.roster}
                    today={form.today}
                    disabled={form.disabled}
                    onConfirm={form.confirmRoster}
                    onClear={form.clearRoster}
                    onReset={form.resetRoster}
                />
            );
        case 'hypothesis':
            return (
                <AiSettingsHypothesisTab
                    state={form.phase4State}
                    rows={form.form.hypothesis}
                    errors={form.errors.hypothesis}
                    disabled={form.disabled}
                    onAdd={form.addHypothesisPair}
                    onChange={form.patchHypothesisPair}
                    onRemove={form.removeHypothesisPair}
                />
            );
        case 'pool':
            return (
                <AiSettingsPoolTab
                    state={form.phase4State}
                    optIn={form.form.poolOptIn}
                    consentAt={form.form.poolConsentAt}
                    pending={form.form.pool}
                    disabled={form.disabled}
                    onGive={form.givePoolConsent}
                    onRevoke={form.revokePoolConsent}
                    onReset={form.resetPool}
                />
            );
    }
};
