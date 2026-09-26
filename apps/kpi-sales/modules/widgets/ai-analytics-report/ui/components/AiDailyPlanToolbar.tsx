'use client';

import { Input } from '@workspace/ui/components/input';
import {
    MicroField,
    MicroSelect,
    type MicroSelectOption,
} from '@workspace/april-ui';

interface AiDailyPlanToolbarProps {
    /** Руководитель выбирает менеджера периметра; менеджер видит своё имя. */
    isLeader: boolean;
    options: MicroSelectOption[];
    managerId: string | null;
    managerName: (managerId: string | null) => string;
    /** Обзор ещё не посчитан — список менеджеров пуст, селект недоступен. */
    overviewPending: boolean;
    date: string;
    dateValid: boolean;
    onManager: (managerId: string) => void;
    onDate: (date: string) => void;
}

/** Панель плана дня: чей план и на какой день. */
export const AiDailyPlanToolbar = ({
    isLeader,
    options,
    managerId,
    managerName,
    overviewPending,
    date,
    dateValid,
    onManager,
    onDate,
}: AiDailyPlanToolbarProps) => (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {isLeader ? (
            <MicroField label="Менеджер">
                <MicroSelect
                    ariaLabel="Менеджер"
                    value={managerId ?? undefined}
                    options={options}
                    disabled={!options.length}
                    placeholder={
                        overviewPending ? 'ждём обзор…' : 'нет менеджеров'
                    }
                    className="max-w-56"
                    onChange={onManager}
                />
            </MicroField>
        ) : (
            <span className="text-xs text-muted-foreground">
                Менеджер:{' '}
                <span className="font-medium text-foreground">
                    {managerName(managerId)}
                </span>
            </span>
        )}
        <MicroField label="День" invalid={!dateValid}>
            <Input
                type="date"
                value={date}
                aria-label="День плана"
                aria-invalid={!dateValid}
                className="h-6 w-36 px-2 py-0 text-[0.6875rem]"
                onChange={event => onDate(event.target.value)}
            />
        </MicroField>
        {isLeader && overviewPending && (
            <span className="text-xs text-muted-foreground">
                Список менеджеров появится после расчёта обзора
            </span>
        )}
    </div>
);
