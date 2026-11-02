'use client';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    METHODOLOGIES_TEXT,
    type MethodologyCatalog,
    type MethodologyCheckpoint,
    type MethodologyCondition,
    type MethodologyConditionOp,
} from '../../../model';
import {
    conditionValueText,
    parseConditionValue,
} from '../../../lib/methodology-form.util';

interface ConditionEditorProps {
    condition: MethodologyCondition;
    catalog: MethodologyCatalog | undefined;
    checkpoints: readonly MethodologyCheckpoint[];
    onChange: (next: MethodologyCondition) => void;
    onRemove: () => void;
}

const CHECKPOINT_OPS: readonly MethodologyConditionOp[] = ['checkpoint_missed', 'checkpoint_done'];
const VALUE_OPS: readonly MethodologyConditionOp[] = ['is', 'not', 'lt', 'lte', 'gt', 'gte'];
const NONE = '__none__';

/** Одно условие ограничителя: операция, факт или пункт, значение. */
export const ConditionEditor = ({
    condition,
    catalog,
    checkpoints,
    onChange,
    onRemove,
}: ConditionEditorProps) => {
    const texts = METHODOLOGIES_TEXT.caps;
    const byCheckpoint = CHECKPOINT_OPS.includes(condition.op);
    const needsValue = VALUE_OPS.includes(condition.op);

    const changeOp = (op: MethodologyConditionOp) => {
        if (CHECKPOINT_OPS.includes(op)) {
            onChange({ op, checkpoint: condition.checkpoint ?? checkpoints[0]?.code });
            return;
        }
        onChange({
            op,
            field: (condition.field ?? catalog?.factFields[0]?.code) as MethodologyCondition['field'],
            ...(VALUE_OPS.includes(op) ? { value: condition.value ?? null } : {}),
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 p-2">
            <Select value={condition.op} onValueChange={value => changeOp(value as MethodologyConditionOp)}>
                <SelectTrigger className="w-56" aria-label={texts.op}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {(catalog?.conditionOps ?? []).map(op => (
                        <SelectItem key={op.code} value={op.code}>
                            {op.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {byCheckpoint ? (
                <Select
                    value={condition.checkpoint ?? NONE}
                    onValueChange={value =>
                        onChange({ ...condition, checkpoint: value === NONE ? undefined : value })
                    }
                >
                    <SelectTrigger className="w-80" aria-label={texts.checkpoint}>
                        <SelectValue placeholder={texts.checkpoint} />
                    </SelectTrigger>
                    <SelectContent>
                        {checkpoints.length === 0 && (
                            <SelectItem value={NONE}>{texts.checkpoint}</SelectItem>
                        )}
                        {checkpoints.map(checkpoint => (
                            <SelectItem key={checkpoint.code} value={checkpoint.code}>
                                {checkpoint.title || checkpoint.code}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <Select
                    value={condition.field ?? NONE}
                    onValueChange={value =>
                        onChange({
                            ...condition,
                            field: value === NONE ? undefined : (value as MethodologyCondition['field']),
                        })
                    }
                >
                    <SelectTrigger className="w-80" aria-label={texts.field}>
                        <SelectValue placeholder={texts.field} />
                    </SelectTrigger>
                    <SelectContent>
                        {(catalog?.factFields ?? []).map(field => (
                            <SelectItem key={field.code} value={field.code}>
                                {field.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
            {needsValue && (
                <Input
                    className="w-36"
                    aria-label={texts.value}
                    placeholder={texts.valueHint}
                    value={conditionValueText(condition.value)}
                    onChange={event =>
                        onChange({ ...condition, value: parseConditionValue(event.target.value) })
                    }
                />
            )}
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
                {texts.remove}
            </Button>
        </div>
    );
};
