'use client';

import { MicroSegmented } from '@workspace/april-ui/fields';
import {
    TEMPLATE_SETTINGS_TABS,
    type TemplateSettingsTab,
} from '../lib/template-settings.util';

export interface TemplateSettingsTabsProps {
    value: TemplateSettingsTab;
    onChange: (value: string) => void;
}

/** Переключатель разделов: шаблоны КП и шаблоны счетов. */
export const TemplateSettingsTabs = ({ value, onChange }: TemplateSettingsTabsProps) => (
    <div>
        <MicroSegmented
            ariaLabel="Раздел настроек шаблонов"
            value={value}
            options={TEMPLATE_SETTINGS_TABS.map(tab => ({ ...tab }))}
            onChange={onChange}
        />
    </div>
);
