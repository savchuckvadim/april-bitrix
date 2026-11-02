'use client';

import { Plus, Trash2 } from 'lucide-react';
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
import type { RenewalExtraLine } from '../../../model';

interface OfferExtrasProps {
    extras: readonly RenewalExtraLine[];
    onAdd: () => void;
    onUpdate: (index: number, patch: Partial<RenewalExtraLine>) => void;
    onRemove: (index: number) => void;
}

/** Цена из поля; мусор считаем нулём — сумма видна рядом. */
function toPrice(value: string): number {
    const parsed = Number(value.replace(/[\s\u00a0]/g, '').replace(',', '.'));
    return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

/** Услуги вне прайса: название, цена, периодичность. */
export function OfferExtras({
    extras,
    onAdd,
    onUpdate,
    onRemove,
}: OfferExtrasProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Другие услуги</Label>
                <Button variant="outline" size="sm" onClick={onAdd}>
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Добавить
                </Button>
            </div>

            {extras.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    Всё, чего нет в прайсе: отдельной строкой со своей ценой.
                </p>
            ) : (
                <div className="space-y-2">
                    {extras.map((line, index) => (
                        <div
                            key={index}
                            className="grid items-center gap-2 sm:grid-cols-[1fr_110px_120px_auto]"
                        >
                            <Input
                                placeholder="Телефония"
                                maxLength={255}
                                value={line.title}
                                onChange={event =>
                                    onUpdate(index, {
                                        title: event.target.value,
                                    })
                                }
                            />
                            <Input
                                inputMode="numeric"
                                value={String(line.price)}
                                onChange={event =>
                                    onUpdate(index, {
                                        price: toPrice(event.target.value),
                                    })
                                }
                            />
                            <Select
                                value={line.period}
                                onValueChange={value =>
                                    onUpdate(index, {
                                        period:
                                            value === 'once' ? 'once' : 'month',
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="month">
                                        в месяц
                                    </SelectItem>
                                    <SelectItem value="once">разово</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Убрать услугу"
                                onClick={() => onRemove(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
