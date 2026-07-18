'use client';

import * as React from 'react';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppEvents } from '../../lib/hooks/use-events';
import { EventsTable } from '../events-table';

const ALL = 'all';
const PAGE_SIZE = 50;

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: ALL, label: 'Все статусы' },
    { value: 'received', label: 'Получено' },
    { value: 'processed', label: 'Обработано' },
    { value: 'error', label: 'Ошибка' },
];

/** Журнал событий приложения: фильтры + пагинация по 50 записей. */
export function EventsList() {
    const [domain, setDomain] = React.useState('');
    const [memberId, setMemberId] = React.useState('');
    const [event, setEvent] = React.useState('');
    const [status, setStatus] = React.useState<string>(ALL);
    const [skip, setSkip] = React.useState(0);

    const { data, isLoading } = useAppEvents({
        domain: domain.trim() || undefined,
        memberId: memberId.trim() || undefined,
        event: event.trim() || undefined,
        status: status === ALL ? undefined : status,
        take: PAGE_SIZE,
        skip,
    });

    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const from = total === 0 ? 0 : skip + 1;
    const to = Math.min(skip + items.length, total);
    const hasPrev = skip > 0;
    const hasNext = skip + PAGE_SIZE < total;

    const resetAnd = <T,>(setter: (value: T) => void) => (value: T) => {
        setSkip(0);
        setter(value);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                <h1 className="text-3xl font-bold">Журнал событий</h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <Input
                        value={domain}
                        onChange={(e) => resetAnd(setDomain)(e.target.value)}
                        placeholder="Домен"
                        className="w-44"
                    />
                    <Input
                        value={memberId}
                        onChange={(e) => resetAnd(setMemberId)(e.target.value)}
                        placeholder="member_id"
                        className="w-44"
                    />
                    <Input
                        value={event}
                        onChange={(e) => resetAnd(setEvent)(e.target.value)}
                        placeholder="Событие (напр. INSTALL_CALLBACK)"
                        className="w-56"
                    />
                    <Select value={status} onValueChange={resetAnd(setStatus)}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Статус" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <EventsTable data={items} isLoading={isLoading && !data} />

            <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">
                    {total > 0 ? `${from}–${to} из ${total}` : 'Нет записей'}
                </span>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasPrev || isLoading}
                        onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Назад
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasNext || isLoading}
                        onClick={() => setSkip(skip + PAGE_SIZE)}
                    >
                        Вперёд
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </>
    );
}
