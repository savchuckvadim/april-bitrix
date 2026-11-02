'use client';

import { useState } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Switch } from '@workspace/ui/components/switch';
import {
    METHODOLOGIES_TEXT,
    type CheckpointEvidence,
    type MethodologyCatalog,
    type MethodologyCheckpoint,
} from '../../../model';
import {
    fromCatalogCheckpoint,
    isValidCheckpointCode,
    newCheckpoint,
} from '../../../lib/methodology-form.util';
import { TypeChips } from './TypeChips';

interface CheckpointsEditorProps {
    checkpoints: MethodologyCheckpoint[];
    /** Типы методики — пункт может относиться только к ним. */
    methodologyTypes: string[];
    catalog: MethodologyCatalog | undefined;
    onChange: (next: MethodologyCheckpoint[]) => void;
}

/** Пункты методики: свои строки и выбор из каталога встроенных. */
export const CheckpointsEditor = ({
    checkpoints,
    methodologyTypes,
    catalog,
    onChange,
}: CheckpointsEditorProps) => {
    const texts = METHODOLOGIES_TEXT.checkpoints;
    const [catalogOpen, setCatalogOpen] = useState(false);
    const [picked, setPicked] = useState<string[]>([]);

    const update = (index: number, patch: Partial<MethodologyCheckpoint>) =>
        onChange(checkpoints.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    const remove = (index: number) => onChange(checkpoints.filter((_, i) => i !== index));
    const add = () => onChange([...checkpoints, newCheckpoint(checkpoints, methodologyTypes)]);
    const addPicked = () => {
        const taken = new Set(checkpoints.map(item => item.code));
        const fromCatalog = (catalog?.checkpoints ?? [])
            .filter(item => picked.includes(item.code) && !taken.has(item.code))
            .map(item => fromCatalogCheckpoint(item, methodologyTypes));
        onChange([...checkpoints, ...fromCatalog]);
        setPicked([]);
        setCatalogOpen(false);
    };

    return (
        <div className="space-y-3">
            {checkpoints.length === 0 && (
                <p className="text-sm text-muted-foreground">{texts.empty}</p>
            )}
            {checkpoints.map((checkpoint, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-border/70 p-3">
                    <div className="grid gap-2 sm:grid-cols-[14rem_1fr]">
                        <div className="space-y-1">
                            <Label>{texts.code}</Label>
                            <Input
                                value={checkpoint.code}
                                aria-invalid={!isValidCheckpointCode(checkpoint.code)}
                                onChange={event => update(index, { code: event.target.value.trim() })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>{texts.title}</Label>
                            <Input
                                value={checkpoint.title}
                                onChange={event => update(index, { title: event.target.value })}
                            />
                        </div>
                    </div>
                    <TypeChips
                        label={texts.types}
                        options={catalog?.callTypes ?? []}
                        allowed={methodologyTypes}
                        value={checkpoint.types}
                        onChange={types => update(index, { types })}
                    />
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                            <Label>{texts.evidence}</Label>
                            <Select
                                value={checkpoint.evidence}
                                onValueChange={value =>
                                    update(index, { evidence: value as CheckpointEvidence })
                                }
                            >
                                <SelectTrigger className="w-72">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(catalog?.evidenceKinds ?? []).map(kind => (
                                        <SelectItem key={kind.code} value={kind.code}>
                                            {kind.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <label className="flex items-center gap-2 pb-2 text-sm">
                            <Switch
                                checked={checkpoint.mandatory}
                                onCheckedChange={mandatory => update(index, { mandatory })}
                            />
                            {texts.mandatory}
                        </label>
                        <div className="min-w-64 flex-1 space-y-1">
                            <Label>{texts.hint}</Label>
                            <Input
                                value={checkpoint.hint ?? ''}
                                onChange={event =>
                                    update(index, { hint: event.target.value || undefined })
                                }
                            />
                        </div>
                        {checkpoint.rule && <Badge variant="secondary">{texts.byRule}</Badge>}
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                            {texts.remove}
                        </Button>
                    </div>
                </div>
            ))}
            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={add}>
                    {texts.add}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCatalogOpen(open => !open)}
                    disabled={!catalog}
                >
                    {texts.fromCatalog}
                </Button>
            </div>
            {catalogOpen && catalog && (
                <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
                    <p className="font-medium">{texts.catalogTitle}</p>
                    <p className="text-xs text-muted-foreground">{texts.catalogHint}</p>
                    <div className="max-h-80 space-y-1 overflow-y-auto">
                        {catalog.checkpoints.map(item => {
                            const taken = checkpoints.some(own => own.code === item.code);
                            return (
                                <label
                                    key={item.code}
                                    className="flex items-start gap-2 rounded px-1 py-1 text-sm hover:bg-accent/40"
                                >
                                    <Checkbox
                                        className="mt-0.5"
                                        disabled={taken}
                                        checked={taken || picked.includes(item.code)}
                                        onCheckedChange={checked =>
                                            setPicked(current =>
                                                checked
                                                    ? [...current, item.code]
                                                    : current.filter(code => code !== item.code),
                                            )
                                        }
                                    />
                                    <span>
                                        {item.title}{' '}
                                        <span className="text-xs text-muted-foreground">
                                            {item.types.join(', ')}
                                            {item.byRule ? ` · ${texts.byRule}` : ''}
                                            {taken ? ` · ${texts.already}` : ''}
                                        </span>
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={addPicked} disabled={!picked.length}>
                            {texts.pick}
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setCatalogOpen(false)}>
                            {texts.close}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
