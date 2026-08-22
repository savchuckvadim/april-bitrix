'use client';

import { FC, useState } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { usePurchaseSignals } from '../lib/hooks/use-purchase-signals';

/**
 * «Покупка и конкуренты» — даты, от которых зависит, когда звонить о покупке.
 *
 * Обязательны к ОЗНАКОМЛЕНИЮ, не к заполнению: карточка стоит на виду и
 * ничего не блокирует. Возможная дата покупки бессмысленна без сроков
 * конкурента — клиент освобождается, когда у того кончается оплата или
 * договор, поэтому поля живут вместе.
 *
 * Самогейтится по слепку: не установлено ни одного поля — карточки нет.
 */
export const PurchaseSignalsCard: FC = () => {
    const signals = usePurchaseSignals();
    // Черновики дат: клавиатурный ввод даёт промежуточные значения
    // («0002-…», пустую строку при стирании), и писать их в CRM на
    // каждый символ значило затирать дату мусором. Пишем по уходу с
    // поля, и только если значение реально изменилось.
    const [drafts, setDrafts] = useState<Record<string, string>>({});

    if (!signals.isAvailable) return null;

    return (
        <SectionCard
            title="Покупка и конкуренты"
            density="compact"
            collapsible
            defaultOpen
        >
            <div className="space-y-2">
                {signals.dates.map(date => (
                    <div key={date.code} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                            {date.label}
                        </Label>
                        <Input
                            type="date"
                            value={drafts[date.code] ?? date.value}
                            onChange={e =>
                                setDrafts(prev => ({
                                    ...prev,
                                    [date.code]: e.target.value,
                                }))
                            }
                            onBlur={() => {
                                const draft = drafts[date.code];
                                if (
                                    draft !== undefined &&
                                    draft !== date.value &&
                                    draft !== ''
                                ) {
                                    date.setValue(draft);
                                }
                            }}
                            className="h-7 text-xs"
                        />
                    </div>
                ))}

                {signals.concurents.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                        {signals.concurents.map(name => (
                            <ToneBadge
                                key={name}
                                tone="muted"
                                variant="soft"
                                size="sm"
                            >
                                {name}
                            </ToneBadge>
                        ))}
                    </div>
                )}

                {signals.error && (
                    <p className="text-xs text-destructive">{signals.error}</p>
                )}
            </div>
        </SectionCard>
    );
};
