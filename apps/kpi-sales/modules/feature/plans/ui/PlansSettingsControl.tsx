'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Target } from 'lucide-react';
import { useAccess } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
import { usePlansSettings } from '../hooks/use-plans-settings';
import { PlansSettingsDialog } from './PlansSettingsDialog';

/**
 * Кнопка «Планы» в хедере отчёта (только PLANS_CONFIGURE — руководители
 * op/cup и суперюзер) + диалог настроек.
 */
export const PlansSettingsControl: React.FC = () => {
    const canConfigure = useAccess(EAccessFeature.PLANS_CONFIGURE);
    const settings = usePlansSettings();

    if (!canConfigure) return null;

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => settings.setOpen(true)}
            >
                <Target className="h-3.5 w-3.5" />
                Планы
            </Button>
            <PlansSettingsDialog
                isOpen={settings.isOpen}
                setOpen={settings.setOpen}
                settings={settings}
            />
        </>
    );
};
