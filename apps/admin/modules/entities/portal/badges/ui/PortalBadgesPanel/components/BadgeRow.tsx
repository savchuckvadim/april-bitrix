'use client';

import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Switch } from '@workspace/ui/components/switch';
import { TONE_SOFT } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { BADGES_TEXT as TEXT } from '../../../consts/badges.const';
import { toggleInList } from '../../../lib/badges-draft';
import type { BadgeItem, BadgeSchema, BadgeTone } from '../../../model';
import { BadgeBindingChips } from './BadgeBindingChips';

interface BadgeRowProps {
    item: BadgeItem;
    schema: BadgeSchema;
    /** Только показать — режим «общие по умолчанию» или общий набор. */
    readOnly?: boolean;
    onChange?: (patch: Partial<BadgeItem>) => void;
    onMove?: (direction: 'up' | 'down') => void;
    onRemove?: () => void;
}

/**
 * Одна строка редактора: текст, цвет, привязки, «сам», «вкл.», порядок.
 * У комментария привязки — итоги работы, у названия — типы события и флаг
 * «подставляется сам»; остальное одинаково.
 */
export const BadgeRow = ({
    item,
    schema,
    readOnly = false,
    onChange,
    onMove,
    onRemove,
}: BadgeRowProps) => {
    const isTitle = item.target === 'title';
    const change = (patch: Partial<BadgeItem>) => onChange?.(patch);

    return (
        <tr className={cn('border-b align-top', !item.isActive && 'opacity-60')}>
            <td className="py-2 pr-3">
                {readOnly ? (
                    <span
                        className={cn(
                            'inline-block rounded-md px-2 py-0.5 text-xs font-medium',
                            TONE_SOFT[item.tone],
                        )}
                    >
                        {item.text}
                    </span>
                ) : (
                    <Input
                        value={item.text}
                        placeholder={TEXT.textPlaceholder}
                        maxLength={schema.textMaxLength}
                        aria-invalid={!item.text.trim()}
                        onChange={e => change({ text: e.target.value })}
                        className="h-8 min-w-56 text-xs"
                    />
                )}
                <p className="mt-0.5 font-mono text-[0.625rem] text-muted-foreground">
                    {item.code}
                </p>
            </td>
            <td className="py-2 pr-3">
                {readOnly ? (
                    <span className="text-xs text-muted-foreground">
                        {schema.tones.find(t => t.code === item.tone)?.name ?? item.tone}
                    </span>
                ) : (
                    <Select
                        value={item.tone}
                        onValueChange={value => change({ tone: value as BadgeTone })}
                    >
                        <SelectTrigger size="sm" className="h-8 w-36 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {schema.tones.map(tone => (
                                <SelectItem key={tone.code} value={tone.code}>
                                    <span
                                        className={cn(
                                            'mr-1.5 inline-block size-2.5 rounded-full',
                                            TONE_SOFT[tone.code as BadgeTone],
                                        )}
                                    />
                                    {tone.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </td>
            <td className="py-2 pr-3">
                {isTitle ? (
                    <BadgeBindingChips
                        options={schema.planTypes}
                        selected={item.planTypes}
                        emptyLabel={TEXT.allTypes}
                        disabled={readOnly}
                        onToggle={code =>
                            change({
                                planTypes: toggleInList(item.planTypes, code as BadgeItem['planTypes'][number]),
                            })
                        }
                    />
                ) : (
                    <BadgeBindingChips
                        options={schema.outcomes}
                        selected={item.outcomes}
                        emptyLabel={TEXT.alwaysVisible}
                        disabled={readOnly}
                        onToggle={code =>
                            change({
                                outcomes: toggleInList(item.outcomes, code as BadgeItem['outcomes'][number]),
                            })
                        }
                    />
                )}
            </td>
            {isTitle && (
                <td className="py-2 pr-3">
                    <Switch
                        checked={item.isDefault}
                        disabled={readOnly}
                        aria-label={TEXT.colDefaultHint}
                        title={TEXT.colDefaultHint}
                        onCheckedChange={isDefault => change({ isDefault })}
                    />
                </td>
            )}
            <td className="py-2 pr-3">
                <Switch
                    checked={item.isActive}
                    disabled={readOnly}
                    aria-label={TEXT.colActive}
                    onCheckedChange={isActive => change({ isActive })}
                />
            </td>
            {!readOnly && (
                <td className="py-2">
                    <div className="flex items-center gap-0.5">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            aria-label={TEXT.moveUp}
                            onClick={() => onMove?.('up')}
                        >
                            <ChevronUp className="size-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            aria-label={TEXT.moveDown}
                            onClick={() => onMove?.('down')}
                        >
                            <ChevronDown className="size-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive"
                            aria-label={TEXT.remove}
                            onClick={onRemove}
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    </div>
                </td>
            )}
        </tr>
    );
};
