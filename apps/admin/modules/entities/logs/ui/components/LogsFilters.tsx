'use client';

import { useEffect, useState } from 'react';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { ALL, LOG_PERIODS } from '../../lib/logs-view';
import { LOG_LEVELS, type LogLevel, type LogsFilter } from '../../model';

interface LogsFiltersProps {
    filter: LogsFilter;
    apps: string[];
    onChange: (filter: LogsFilter) => void;
}

/** Текстовое поле фильтра: применяется по Enter или при уходе с поля. */
const CommitInput = ({
    value,
    placeholder,
    onCommit,
}: {
    value: string;
    placeholder: string;
    onCommit: (value: string) => void;
}) => {
    const [draft, setDraft] = useState(value);
    useEffect(() => setDraft(value), [value]);
    return (
        <Input
            value={draft}
            placeholder={placeholder}
            className="w-56"
            onChange={event => setDraft(event.target.value)}
            onBlur={() => draft !== value && onCommit(draft)}
            onKeyDown={event => event.key === 'Enter' && onCommit(draft)}
        />
    );
};

/** Фильтры журналов: окно, приложение, уровень, портал, текст. */
export const LogsFilters = ({ filter, apps, onChange }: LogsFiltersProps) => (
    <div className="flex flex-wrap items-center gap-2">
        <Select
            value={String(filter.hours)}
            onValueChange={value => onChange({ ...filter, hours: Number(value) })}
        >
            <SelectTrigger className="w-32">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {LOG_PERIODS.map(period => (
                    <SelectItem key={period.hours} value={String(period.hours)}>
                        {period.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>

        <Select
            value={filter.app || ALL}
            onValueChange={value => onChange({ ...filter, app: value === ALL ? undefined : value })}
        >
            <SelectTrigger className="w-48">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={ALL}>Все приложения</SelectItem>
                {apps.map(app => (
                    <SelectItem key={app} value={app}>
                        {app}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>

        <Select
            value={filter.level || ALL}
            onValueChange={value =>
                onChange({ ...filter, level: value === ALL ? undefined : (value as LogLevel) })
            }
        >
            <SelectTrigger className="w-36">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={ALL}>Все уровни</SelectItem>
                {LOG_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>
                        {level}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>

        <CommitInput
            value={filter.domain ?? ''}
            placeholder="Портал: gsr.bitrix24.ru"
            onCommit={domain => onChange({ ...filter, domain: domain || undefined })}
        />
        <CommitInput
            value={filter.search ?? ''}
            placeholder="Текст сообщения"
            onCommit={search => onChange({ ...filter, search: search || undefined })}
        />
    </div>
);
