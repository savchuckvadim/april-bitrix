'use client';

import React from 'react';
import { Target } from 'lucide-react';
import { useAccess } from '@/modules/app';
import { HeaderAction } from '@/modules/shared';
import { EAccessFeature } from '@/modules/shared/access';
import { usePlansSettings } from '../hooks/use-plans-settings';
import { PlansSettingsDialog } from './PlansSettingsDialog';

/**
 * Кнопка «Планы» в хедере отчёта (только PLANS_CONFIGURE — руководители
 * op/cup и суперюзер) + диалог настроек. Кнопка — иконка, название в подсказке.
 */
export const PlansSettingsControl: React.FC = () => {
    const canConfigure = useAccess(EAccessFeature.PLANS_CONFIGURE);
    const settings = usePlansSettings();

    if (!canConfigure) return null;

    return (
        <>
            <HeaderAction
                icon={Target}
                label="Планы"
                hint="Настройка плановых показателей"
                onClick={() => settings.setOpen(true)}
            />
            <PlansSettingsDialog
                isOpen={settings.isOpen}
                setOpen={settings.setOpen}
                settings={settings}
            />
        </>
    );
};
