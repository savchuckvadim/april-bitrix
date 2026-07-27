'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { ChevronDown, ChevronUp, Percent } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { conversionsActions } from '../model/conversions-slice';
import type { ConversionScope } from '../model/conversion.types';
import { useConversionDataset } from '../hooks/use-conversions.hook';
import { ConversionChainEditor } from './ConversionChainEditor';
import { ConversionMethodSwitch } from './ConversionMethodSwitch';

interface ConversionTableSettingsProps {
    scope: ConversionScope;
}

/**
 * Полоска настроек конверсий над основной таблицей: тумблер «показывать %»,
 * разворачиваемые (settingsOpen персистится) метод и цепочка показателей.
 */
export const ConversionTableSettings: React.FC<
    ConversionTableSettingsProps
> = ({ scope }) => {
    const dispatch = useAppDispatch();
    const config = useAppSelector(state => state.conversions.table[scope]);
    const dataset = useConversionDataset(scope);

    if (!dataset.rows.length) return null;

    const patch = (values: Parameters<
        typeof conversionsActions.setTableConfig
    >[0]['patch']) =>
        dispatch(conversionsActions.setTableConfig({ scope, patch: values }));

    return (
        <div className="mb-2 rounded-md border border-border bg-background-muted px-3 py-2">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label
                        htmlFor={`conversions-switch-${scope}`}
                        className="text-xs cursor-pointer"
                    >
                        Конверсии в таблице
                    </Label>
                    <Switch
                        id={`conversions-switch-${scope}`}
                        checked={config.enabled}
                        onCheckedChange={enabled => patch({ enabled })}
                    />
                </div>
                {config.enabled && (
                    <>
                        <ConversionMethodSwitch
                            method={config.method}
                            onChange={method => patch({ method })}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() =>
                                patch({ settingsOpen: !config.settingsOpen })
                            }
                        >
                            Показатели ({config.codes.length})
                            {config.settingsOpen ? (
                                <ChevronUp className="ml-1 h-3 w-3" />
                            ) : (
                                <ChevronDown className="ml-1 h-3 w-3" />
                            )}
                        </Button>
                    </>
                )}
            </div>
            {config.enabled && config.settingsOpen && (
                <div className="mt-3 border-t border-border pt-3">
                    <ConversionChainEditor
                        actions={dataset.actions}
                        codes={config.codes}
                        onChange={codes => patch({ codes })}
                    />
                </div>
            )}
        </div>
    );
};
