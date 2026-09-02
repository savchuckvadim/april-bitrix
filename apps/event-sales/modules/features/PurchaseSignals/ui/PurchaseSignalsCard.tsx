'use client';

import { FC, useState } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { ChoiceChips } from '@/modules/shared/ui/ChoiceChips';
import { usePurchaseSignals } from '../lib/hooks/use-purchase-signals';

/**
 * «Покупка и конкуренты» — даты, от которых зависит, когда звонить о покупке,
 * и сами конкуренты клиента.
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

                {signals.concurents.options.length > 0 && (
                    <div className="space-y-1 pt-1">
                        <Label className="text-xs text-muted-foreground">
                            Конкуренты
                        </Label>
                        {/* Пишет в CRM сразу, как даты рядом. */}
                        <ChoiceChips
                            ariaLabel="Конкуренты"
                            options={signals.concurents.options}
                            selected={signals.concurents.selected}
                            onToggle={signals.concurents.toggle}
                        />
                    </div>
                )}

                {signals.error && (
                    <p className="text-xs text-destructive">{signals.error}</p>
                )}
            </div>
        </SectionCard>
    );
};
