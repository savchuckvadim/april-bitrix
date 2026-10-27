'use client';

import { Plus } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { BADGES_TEXT as TEXT } from '../../../consts/badges.const';
import { sortedGroup } from '../../../lib/badges-draft';
import type { BadgeItem, BadgeSchema, BadgeTarget } from '../../../model';
import { BadgeRow } from './BadgeRow';

interface BadgeGroupTableProps {
    target: BadgeTarget;
    items: readonly BadgeItem[];
    schema: BadgeSchema;
    readOnly?: boolean;
    onAdd?: () => void;
    onChange?: (code: string, patch: Partial<BadgeItem>) => void;
    onMove?: (code: string, direction: 'up' | 'down') => void;
    onRemove?: (code: string) => void;
}

/** Группа одной цели — комментарий или название — таблицей в порядке показа. */
export const BadgeGroupTable = ({
    target,
    items,
    schema,
    readOnly = false,
    onAdd,
    onChange,
    onMove,
    onRemove,
}: BadgeGroupTableProps) => {
    const isTitle = target === 'title';
    const group = sortedGroup(items, target);

    return (
        <section className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h4 className="text-sm font-medium">
                        {isTitle ? TEXT.titleSection : TEXT.commentSection}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                        {isTitle ? TEXT.titleHint : TEXT.commentHint}
                    </p>
                </div>
                {!readOnly && onAdd && (
                    <Button type="button" variant="outline" size="sm" onClick={onAdd}>
                        <Plus className="size-3.5" />
                        {isTitle ? TEXT.addTitle : TEXT.addComment}
                    </Button>
                )}
            </div>

            {group.length === 0 ? (
                <p className="text-xs text-muted-foreground">{TEXT.emptyGroup}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[40rem] text-left">
                        <thead>
                            <tr className="border-b text-xs text-muted-foreground">
                                <th className="py-2 pr-3 font-normal">{TEXT.colText}</th>
                                <th className="py-2 pr-3 font-normal">{TEXT.colTone}</th>
                                <th className="py-2 pr-3 font-normal">
                                    {isTitle ? TEXT.colTypes : TEXT.colBindings}
                                </th>
                                {isTitle && (
                                    <th
                                        className="py-2 pr-3 font-normal"
                                        title={TEXT.colDefaultHint}
                                    >
                                        {TEXT.colDefault}
                                    </th>
                                )}
                                <th className="py-2 pr-3 font-normal">{TEXT.colActive}</th>
                                {!readOnly && <th className="py-2" />}
                            </tr>
                        </thead>
                        <tbody>
                            {group.map(item => (
                                <BadgeRow
                                    key={item.code}
                                    item={item}
                                    schema={schema}
                                    readOnly={readOnly}
                                    onChange={patch => onChange?.(item.code, patch)}
                                    onMove={direction => onMove?.(item.code, direction)}
                                    onRemove={() => onRemove?.(item.code)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};
