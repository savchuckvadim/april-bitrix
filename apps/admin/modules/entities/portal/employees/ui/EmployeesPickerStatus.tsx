'use client';

import { RefreshCw } from 'lucide-react';
import { MicroSpinner } from '@workspace/april-ui/feedback';
import { EMPLOYEES_TEXT as TEXT } from '../consts/employees.const';

interface EmployeesPickerStatusProps {
    isLoading: boolean;
    isError: boolean;
    isRefreshing: boolean;
    onRefresh: () => void;
}

/** Строка под выбором: загрузка, ошибка и «Обновить список». */
export const EmployeesPickerStatus = ({
    isLoading,
    isError,
    isRefreshing,
    onRefresh,
}: EmployeesPickerStatusProps) => (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {isLoading && (
            <span className="inline-flex items-center gap-1.5">
                <MicroSpinner />
                {TEXT.loading}
            </span>
        )}
        {isError && <span className="text-destructive">{TEXT.loadError}</span>}
        <button
            type="button"
            className="inline-flex items-center gap-1 hover:text-foreground disabled:opacity-50"
            onClick={onRefresh}
            disabled={isRefreshing}
        >
            <RefreshCw
                aria-hidden
                className={isRefreshing ? 'size-3 animate-spin' : 'size-3'}
            />
            {TEXT.refresh}
        </button>
    </div>
);
