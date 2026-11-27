'use client';

import { TemplateShopScreen } from '@/modules/widgets/template-shop';
import { useTemplateSettings } from '../hooks/use-template-settings';
import { LazyInvoiceTemplatesScreen } from './lazy';
import { TemplateSettingsTabs } from './TemplateSettingsTabs';

/**
 * Настройки шаблонов: витрина шаблонов КП и управление шаблонами счетов.
 * Каждый раздел сам рисует заголовок, переключатель разделов стоит над ним.
 */
export const TemplateSettingsScreen = () => {
    const settings = useTemplateSettings();
    const tabs = <TemplateSettingsTabs value={settings.tab} onChange={settings.setTab} />;

    return settings.tab === 'invoice' ? (
        <LazyInvoiceTemplatesScreen tabs={tabs} />
    ) : (
        <TemplateShopScreen tabs={tabs} />
    );
};
