'use client';

import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    METHODOLOGIES_TEXT,
    type MethodologyCatalog,
    type MethodologySpirals,
} from '../../../model';
import { TypeChips } from './TypeChips';

interface RulesEditorProps {
    principles: string[];
    spirals: MethodologySpirals;
    methodologyTypes: string[];
    catalog: MethodologyCatalog | undefined;
    onPrinciples: (next: string[]) => void;
    onSpirals: (next: MethodologySpirals) => void;
}

/** Правила методики (по строке на правило) и настройки спиралей презентации. */
export const RulesEditor = ({
    principles,
    spirals,
    methodologyTypes,
    catalog,
    onPrinciples,
    onSpirals,
}: RulesEditorProps) => {
    const texts = METHODOLOGIES_TEXT.rules;
    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <Label htmlFor="methodology-principles">{texts.principles}</Label>
                <Textarea
                    id="methodology-principles"
                    rows={8}
                    value={principles.join('\n')}
                    onChange={event => onPrinciples(event.target.value.split('\n'))}
                    onBlur={() =>
                        onPrinciples(principles.map(line => line.trim()).filter(line => line !== ''))
                    }
                />
                <p className="text-xs text-muted-foreground">{texts.principlesHint}</p>
            </div>
            <div className="space-y-3 rounded-lg border border-border/70 p-3">
                <div>
                    <p className="font-medium">{texts.spirals}</p>
                    <p className="text-xs text-muted-foreground">{texts.spiralsHint}</p>
                </div>
                <div className="flex flex-wrap items-end gap-4">
                    <label className="flex items-center gap-2 pb-2 text-sm">
                        <Switch
                            checked={spirals.enabled}
                            onCheckedChange={enabled => onSpirals({ ...spirals, enabled })}
                        />
                        {texts.enabled}
                    </label>
                    <div className="space-y-1">
                        <Label htmlFor="methodology-spirals-min">{texts.minFull}</Label>
                        <Input
                            id="methodology-spirals-min"
                            type="number"
                            min={0}
                            max={20}
                            className="w-24"
                            disabled={!spirals.enabled}
                            value={spirals.minFull}
                            onChange={event =>
                                onSpirals({ ...spirals, minFull: Number(event.target.value) })
                            }
                        />
                    </div>
                </div>
                <TypeChips
                    label={texts.types}
                    options={catalog?.callTypes ?? []}
                    allowed={methodologyTypes}
                    value={spirals.types}
                    onChange={types => onSpirals({ ...spirals, types })}
                />
            </div>
        </div>
    );
};
