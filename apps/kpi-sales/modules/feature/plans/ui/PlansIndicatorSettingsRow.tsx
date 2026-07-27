'use client';

import React from 'react';
import { Input } from '@workspace/ui/components/input';
import { Switch } from '@workspace/ui/components/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import type { PlanIndicatorConfig, PlanIndicatorMeta } from '../model';
import { PLAN_PERIOD_LABELS } from '../lib/plans.data';

interface PlansIndicatorSettingsRowProps {
    meta: PlanIndicatorMeta;
    config: PlanIndicatorConfig;
    onPatch: (patch: Partial<Omit<PlanIndicatorConfig, 'code'>>) => void;
}

/** Строка настройки показателя: вкл/выкл, своё имя, период задания. */
export const PlansIndicatorSettingsRow: React.FC<
    PlansIndicatorSettingsRowProps
> = ({ meta, config, onPatch }) => (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2">
        <Switch
            checked={config.enabled}
            onCheckedChange={enabled => onPatch({ enabled })}
        />
        <span className="min-w-[160px] text-sm">{meta.defaultName}</span>
        <Input
            value={config.customName ?? ''}
            onChange={event =>
                onPatch({ customName: event.target.value || null })
            }
            placeholder="Своё название (необязательно)"
            className="h-8 w-56 text-xs"
            disabled={!config.enabled}
        />
        <Select
            value={config.periodType}
            onValueChange={value =>
                onPatch({
                    periodType: value as PlanIndicatorConfig['periodType'],
                })
            }
            disabled={!config.enabled}
        >
            <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {(
                    Object.entries(PLAN_PERIOD_LABELS) as [
                        PlanIndicatorConfig['periodType'],
                        string,
                    ][]
                ).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-xs">
                        {label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);
