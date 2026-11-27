'use client';

import { useState } from 'react';
import {
    toSettingsTab,
    type TemplateSettingsTab,
} from '../lib/template-settings.util';

/** Раздел настроек шаблонов: открывается витрина КП, счета выбираются переключателем. */
export const useTemplateSettings = () => {
    const [tab, setTab] = useState<TemplateSettingsTab>('offer');

    return {
        tab,
        setTab: (value: string) => setTab(toSettingsTab(value)),
    };
};
