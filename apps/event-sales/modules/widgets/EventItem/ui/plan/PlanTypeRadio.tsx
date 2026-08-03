'use client';

import { FC } from 'react';
import { Label } from '@workspace/ui/components/label';
import {
    RadioGroup,
    RadioGroupItem,
} from '@workspace/ui/components/radio-group';
import { TONE_TEXT } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import type { EventPlanCall } from '@/modules/entities/EventPlan';
import { getPlanTypeMeta } from '../../lib/plan-type-catalog';

interface PlanTypeRadioProps {
    items: EventPlanCall[];
    value: string | undefined;
    onChange: (value: string) => void;
}

/**
 * Выбор типа планируемого события списком, а не выпадашкой.
 *
 * Так все типы видны сразу и различаются цветом и эмодзи — менеджер выбирает
 * узнаванием, а не чтением. Раскладка повторяет симулятор процесса, где эта
 * подача уже отработана.
 */
export const PlanTypeRadio: FC<PlanTypeRadioProps> = ({
    items,
    value,
    onChange,
}) => (
    <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Тип события</Label>
        <RadioGroup value={value} onValueChange={onChange} className="space-y-1">
            {items.map(item => {
                const meta = getPlanTypeMeta(item.code);
                const Icon = meta.icon;
                const id = `plan-type-${item.id}`;

                return (
                    <div key={item.id} className="flex items-center gap-2">
                        <RadioGroupItem
                            id={id}
                            value={String(item.id)}
                            className="cursor-pointer"
                        />
                        <Label
                            htmlFor={id}
                            title={meta.hint}
                            className="flex cursor-pointer items-center gap-1.5 text-xs font-normal"
                        >
                            <Icon
                                aria-hidden
                                className={cn(
                                    'size-4 shrink-0',
                                    TONE_TEXT[meta.tone],
                                )}
                            />
                            {item.name}
                        </Label>
                    </div>
                );
            })}
        </RadioGroup>
    </div>
);
