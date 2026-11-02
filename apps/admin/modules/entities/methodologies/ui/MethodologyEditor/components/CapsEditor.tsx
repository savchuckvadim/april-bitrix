'use client';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    METHODOLOGIES_TEXT,
    type MethodologyCap,
    type MethodologyCapTarget,
    type MethodologyCatalog,
    type MethodologyCheckpoint,
    type MethodologyCondition,
} from '../../../model';
import {
    capText,
    conditionText,
    newCap,
    newCondition,
} from '../../../lib/methodology-form.util';
import { ConditionEditor } from './ConditionEditor';
import { TypeChips } from './TypeChips';

interface CapsEditorProps {
    caps: MethodologyCap[];
    checkpoints: MethodologyCheckpoint[];
    methodologyTypes: string[];
    catalog: MethodologyCatalog | undefined;
    onChange: (next: MethodologyCap[]) => void;
}

/** Ограничители методики: условия → потолок оценки раздела или итога; ядро — для справки. */
export const CapsEditor = ({
    caps,
    checkpoints,
    methodologyTypes,
    catalog,
    onChange,
}: CapsEditorProps) => {
    const texts = METHODOLOGIES_TEXT.caps;

    const update = (index: number, patch: Partial<MethodologyCap>) =>
        onChange(caps.map((cap, i) => (i === index ? { ...cap, ...patch } : cap)));
    const updateCondition = (capIndex: number, condIndex: number, next: MethodologyCondition | null) => {
        const cap = caps[capIndex];
        if (!cap) return;
        const when = next === null
            ? cap.when.filter((_, i) => i !== condIndex)
            : cap.when.map((condition, i) => (i === condIndex ? next : condition));
        update(capIndex, { when });
    };

    return (
        <div className="space-y-3">
            {caps.length === 0 && <p className="text-sm text-muted-foreground">{texts.empty}</p>}
            {caps.map((cap, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-border/70 p-3">
                    <div className="grid gap-2 sm:grid-cols-[14rem_1fr]">
                        <div className="space-y-1">
                            <Label>{texts.code}</Label>
                            <Input
                                value={cap.code}
                                onChange={event => update(index, { code: event.target.value.trim() })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>{texts.title}</Label>
                            <Input
                                value={cap.title}
                                onChange={event => update(index, { title: event.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                            <Label>{texts.target}</Label>
                            <Select
                                value={cap.target}
                                onValueChange={value => update(index, { target: value as MethodologyCapTarget })}
                            >
                                <SelectTrigger className="w-64">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(catalog?.capTargets ?? []).map(target => (
                                        <SelectItem key={target.code} value={target.code}>
                                            {target.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>{texts.max}</Label>
                            <Input
                                type="number"
                                min={1}
                                max={10}
                                className="w-24"
                                value={cap.max}
                                onChange={event => update(index, { max: Number(event.target.value) })}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                            onClick={() => onChange(caps.filter((_, i) => i !== index))}
                        >
                            {texts.remove}
                        </Button>
                    </div>
                    <TypeChips
                        label={texts.types}
                        options={catalog?.callTypes ?? []}
                        allowed={methodologyTypes}
                        value={cap.types ?? []}
                        onChange={types => update(index, { types: types.length ? types : undefined })}
                    />
                    <div className="space-y-2">
                        <Label>{texts.when}</Label>
                        {cap.when.map((condition, condIndex) => (
                            <ConditionEditor
                                key={condIndex}
                                condition={condition}
                                catalog={catalog}
                                checkpoints={checkpoints}
                                onChange={next => updateCondition(index, condIndex, next)}
                                onRemove={() => updateCondition(index, condIndex, null)}
                            />
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => update(index, { when: [...cap.when, newCondition()] })}
                        >
                            {texts.addCondition}
                        </Button>
                    </div>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => onChange([...caps, newCap(caps)])}>
                {texts.add}
            </Button>
            {catalog && catalog.coreCaps.length > 0 && (
                <div className="space-y-1 rounded-lg border border-dashed border-border p-3">
                    <p className="font-medium">{texts.coreTitle}</p>
                    <p className="text-xs text-muted-foreground">{texts.coreHint}</p>
                    <ul className="space-y-1 text-sm">
                        {catalog.coreCaps.map(cap => (
                            <li key={cap.code}>
                                <span className="font-medium">{cap.title}</span>
                                <span className="text-muted-foreground">
                                    {' — '}
                                    {capText(cap, catalog)}
                                    {cap.when.length > 0 && ': '}
                                    {cap.when
                                        .map(condition => conditionText(condition, catalog, checkpoints))
                                        .join('; ')}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
