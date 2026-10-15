'use client';

import { useMemo } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { HOOK_ENTITY_LABEL, HOOKS_TEXT } from '../../../consts/hooks.const';
import { summarizeHookEffects, type HookEffectFields } from '../../../lib/hooks-view';
import type { HookCatalogEntry } from '../../../model';

interface HookEffectsProps {
    entry: HookCatalogEntry;
}

const FieldList = ({ title, groups }: { title: string; groups: HookEffectFields[] }) =>
    groups.length === 0 ? null : (
        <div className="space-y-1">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
                {title}
            </div>
            {groups.map(group => (
                <div key={group.entity} className="text-sm">
                    <span className="font-medium">{HOOK_ENTITY_LABEL[group.entity]}:</span>{' '}
                    {group.fields.map((field, index) => (
                        <span key={field.code}>
                            {index > 0 && ', '}
                            <span title={field.code}>{field.name}</span>
                            {field.required && <span className="text-destructive">*</span>}
                        </span>
                    ))}
                </div>
            ))}
        </div>
    );

/**
 * «Что хук меняет в CRM» — к чему приведёт подключение: какие поля по
 * сущностям он пишет и читает, какие стадии использует, чем включается.
 * Выводится из описания хука; подробности — во вкладке «Поля и стадии».
 */
export const HookEffects = ({ entry }: HookEffectsProps) => {
    const effects = useMemo(() => summarizeHookEffects(entry), [entry]);
    const hasFields = effects.writes.length > 0 || effects.reads.length > 0;

    return (
        <SectionCard title={HOOKS_TEXT.effectsTitle} description={HOOKS_TEXT.effectsHint}>
            <div className="space-y-3">
                {hasFields ? (
                    <>
                        <FieldList title={HOOKS_TEXT.effectsWrites} groups={effects.writes} />
                        <FieldList title={HOOKS_TEXT.effectsReads} groups={effects.reads} />
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">{HOOKS_TEXT.effectsEmpty}</p>
                )}
                {effects.stages.length > 0 && (
                    <div className="space-y-1">
                        <div className="text-xs font-semibold uppercase text-muted-foreground">
                            {HOOKS_TEXT.effectsStages}
                        </div>
                        <div className="text-sm">
                            {effects.stages.map((stage, index) => (
                                <span key={`${stage.entity}:${stage.code}`}>
                                    {index > 0 && ', '}
                                    <span title={stage.code}>
                                        {HOOK_ENTITY_LABEL[stage.entity]}: {stage.title}
                                    </span>
                                    {stage.required && <span className="text-destructive">*</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase text-muted-foreground">
                        {HOOKS_TEXT.effectsGates}
                    </div>
                    {effects.gates.length > 0 ? (
                        <div className="text-sm">
                            {effects.gates.map(gate => (
                                <div key={gate.code}>
                                    {gate.name}{' '}
                                    <code className="font-mono text-xs text-muted-foreground">
                                        {gate.code}
                                    </code>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">{HOOKS_TEXT.effectsNoGate}</p>
                    )}
                </div>
            </div>
        </SectionCard>
    );
};
