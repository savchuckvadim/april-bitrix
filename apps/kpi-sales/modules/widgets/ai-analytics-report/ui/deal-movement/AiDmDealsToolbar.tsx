'use client';

import {
    MicroSelect,
    MultiCombobox,
    type MicroSelectOption,
    type MultiComboboxOption,
} from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';
import { AI_DM_ALL_MANAGERS } from '../../lib/deal-movement/ai-deal-movement-deals.util';

const T = AI_DEAL_MOVEMENT_TEXT.deals;

interface AiDmDealsToolbarProps {
    managerOptions: MicroSelectOption[];
    managerId: string | null;
    onManagerChange: (value: string) => void;
    statusOptions: MultiComboboxOption[];
    statuses: readonly string[];
    onStatusesChange: (values: string[]) => void;
    /** Есть выбранный фильтр — показать «Сбросить фильтры». */
    canReset: boolean;
    onReset: () => void;
    disabled?: boolean;
}

/** Фильтры списка проблемных сделок: менеджер, статусы, сброс. */
export const AiDmDealsToolbar = ({
    managerOptions,
    managerId,
    onManagerChange,
    statusOptions,
    statuses,
    onStatusesChange,
    canReset,
    onReset,
    disabled = false,
}: AiDmDealsToolbarProps) => (
    <div className="flex flex-wrap items-center gap-2">
        <MicroSelect
            ariaLabel={T.managerLabel}
            value={managerId ?? AI_DM_ALL_MANAGERS}
            options={managerOptions}
            onChange={onManagerChange}
            disabled={disabled}
        />
        <MultiCombobox
            ariaLabel={T.statusLabel}
            allLabel={T.statusAll}
            manyLabel={T.statusMany}
            options={statusOptions}
            value={statuses}
            onChange={onStatusesChange}
            disabled={disabled || !statusOptions.length}
        />
        {canReset && (
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={onReset}
            >
                {T.reset}
            </Button>
        )}
    </div>
);
