'use client';

import { ActionTile } from '@workspace/april-ui/actions';
import { SectionCard } from '@workspace/april-ui/surfaces';
import type { ParamOption } from '../lib/build-params-options';

export interface ParamTilesProps<T extends string> {
    title: string;
    options: ParamOption<T>[];
    value: T;
    onChange: (value: T) => void;
}

/** Выбор одного параметра плитками: линейка, вид доступа. */
export const ParamTiles = <T extends string>({
    title,
    options,
    value,
    onChange,
}: ParamTilesProps<T>) => (
    <SectionCard title={title}>
        <div className="grid gap-3 sm:grid-cols-2">
            {options.map(option => (
                <ActionTile
                    key={option.value}
                    icon={option.icon}
                    title={option.title}
                    description={option.description}
                    selected={option.value === value}
                    onClick={() => onChange(option.value)}
                />
            ))}
        </div>
    </SectionCard>
);
