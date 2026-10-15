'use client';

import { MicroSegmented, MicroSelect } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import {
    PRES_STATUS_LABELS,
    PRES_STATUS_ORDER,
    type DigestPresDayStatus,
    type PresFilter,
} from '@/modules/entities/digest';

interface PresFiltersProps {
    filter: PresFilter;
    employeeOptions: { value: string; label: string }[];
    onUser: (value: string) => void;
    onStatus: (status: DigestPresDayStatus) => void;
    onCompany: (value: string) => void;
    onInitiative: (value: string) => void;
    onReset: () => void;
}

const COMPANY_OPTIONS = [
    { value: 'all', label: 'Все' },
    { value: 'with', label: 'С компанией' },
    { value: 'without', label: 'Без компании' },
];

const INITIATIVE_OPTIONS = [
    { value: 'all', label: 'Все' },
    { value: 'planned', label: 'Запланированные' },
    { value: 'spontaneous', label: 'Спонтанные' },
];

/** Фильтры презентаций: сотрудник, статусы-бейджи, компания, инициатива. */
export const PresFilters = ({
    filter,
    employeeOptions,
    onUser,
    onStatus,
    onCompany,
    onInitiative,
    onReset,
}: PresFiltersProps) => (
    <div className="flex flex-wrap items-center gap-2">
        <MicroSelect
            ariaLabel="Сотрудник"
            value={filter.userId === null ? 'all' : String(filter.userId)}
            options={employeeOptions}
            onChange={onUser}
            className="max-w-56"
        />
        <div className="flex flex-wrap gap-1" role="group" aria-label="Статусы">
            {PRES_STATUS_ORDER.map(status => {
                const active = filter.statuses.has(status);
                return (
                    <button
                        key={status}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onStatus(status)}
                        className={cn(
                            'rounded-md border px-2 py-0.5 text-[0.6875rem] transition-colors',
                            active
                                ? 'border-primary bg-primary/10 text-foreground'
                                : 'border-border text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {PRES_STATUS_LABELS[status]}
                    </button>
                );
            })}
        </div>
        <MicroSegmented
            ariaLabel="Компания"
            size="xs"
            options={COMPANY_OPTIONS}
            value={filter.company}
            onChange={onCompany}
        />
        <MicroSegmented
            ariaLabel="Инициатива"
            size="xs"
            options={INITIATIVE_OPTIONS}
            value={filter.initiative}
            onChange={onInitiative}
        />
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[0.6875rem]" onClick={onReset}>
            Сбросить
        </Button>
    </div>
);
