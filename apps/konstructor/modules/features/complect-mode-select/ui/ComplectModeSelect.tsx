'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useComplectModeSelect } from '../hooks/use-complect-mode-select';
import { COMPLECT_MODE_FIELD_TITLE, COMPLECT_MODE_OFFER_NOTE } from '../lib/complect-mode-view';

/**
 * Какие варианты комплекта идут в договор и отчёт о поставке: только открытый,
 * все одним договором или все с отдельным договором на каждый. Одна настройка
 * сделки на оба экрана. Показывается, когда незакрытых вариантов два и больше.
 * Недоступный пункт отключён, причина написана под выбором.
 */
export const ComplectModeSelect = () => {
    const select = useComplectModeSelect();

    if (!select.isVisible) return null;

    return (
        <SectionCard density="compact" title={COMPLECT_MODE_FIELD_TITLE}>
            <Select value={select.mode} disabled={select.isBusy} onValueChange={select.setMode}>
                <SelectTrigger size="sm" className="w-80 max-w-full" aria-label={COMPLECT_MODE_FIELD_TITLE}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {select.options.map(option => (
                        <SelectItem key={option.mode} value={option.mode} disabled={option.disabled}>
                            {option.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {select.singleContractUnavailable ? (
                <p className="text-xs text-muted-foreground">{select.singleContractUnavailable}</p>
            ) : null}
            {select.singleContractDiverged ? (
                <p className="text-xs text-destructive">{select.singleContractDiverged}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">{select.note}</p>
            <p className="text-xs text-muted-foreground">{COMPLECT_MODE_OFFER_NOTE}</p>
        </SectionCard>
    );
};
