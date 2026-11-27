/** Разделы настроек шаблонов: КП и счета. */
export type TemplateSettingsTab = 'offer' | 'invoice';

export const TEMPLATE_SETTINGS_TABS: readonly {
    value: TemplateSettingsTab;
    label: string;
}[] = [
    { value: 'offer', label: 'Шаблоны КП' },
    { value: 'invoice', label: 'Шаблоны счетов' },
];

/** Раздел по значению переключателя; незнакомое значение открывает КП. */
export const toSettingsTab = (value: string): TemplateSettingsTab =>
    TEMPLATE_SETTINGS_TABS.find(tab => tab.value === value)?.value ?? 'offer';
