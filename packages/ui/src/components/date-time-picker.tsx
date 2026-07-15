'use client';

import * as React from 'react';
import { format, parse } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Calendar } from '@workspace/ui/components/calendar';
import { Label } from '@workspace/ui/components/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import { TimePicker } from '@workspace/ui/components/time-picker';

export interface TimelineEvent {
    time: string;
    title: string;
    type: string;
}

export interface DateTimePickerProps {
    /** значение в формате 'yyyy-MM-dd HH:mm' */
    value: string;
    onChange: (value: string) => void;
    /**
     * События выбранного дня для таймлайна TimePicker.
     * Консюмер запрашивает их сам (по onDateCommit) и передаёт сюда;
     * пусто/не передано — таймлайн не показывается.
     */
    existingEvents?: TimelineEvent[];
    /** Дата зафиксирована (выбор в календаре) — момент подгрузить расписание дня. */
    onDateCommit?: (date: string) => void;
    dateLabel?: string;
    timeLabel?: string;
    className?: string;
}

const parseValue = (value: string): { date: Date | undefined; time: string } => {
    if (!value) return { date: undefined, time: '' };
    const parsed = parse(value, 'yyyy-MM-dd HH:mm', new Date());
    if (isNaN(parsed.getTime())) return { date: undefined, time: '' };
    return { date: parsed, time: format(parsed, 'HH:mm') };
};

/**
 * Дата + время: Calendar в Popover + TimePicker (ручной ввод, таймлайн
 * занятости дня через existingEvents). Наружу — строка 'yyyy-MM-dd HH:mm'.
 */
export const DateTimePicker = ({
    value,
    onChange,
    existingEvents,
    onDateCommit,
    dateLabel = 'Дата',
    timeLabel = 'Время',
    className,
}: DateTimePickerProps) => {
    const [showCalendar, setShowCalendar] = React.useState(false);
    const { date, time } = parseValue(value);

    const emit = (nextDate: Date | undefined, nextTime: string) => {
        const day = nextDate ?? new Date();
        onChange(`${format(day, 'yyyy-MM-dd')} ${nextTime || '10:00'}`);
    };

    return (
        <div className={cn('grid grid-cols-2 gap-2', className)}>
            <div className="space-y-1.5">
                <Label>{dateLabel}</Label>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 size-4" />
                            {date
                                ? format(date, 'd MMMM yyyy', { locale: ru })
                                : 'Выберите дату'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={selected => {
                                const nextDate = selected ?? undefined;
                                emit(nextDate, time);
                                setShowCalendar(false);
                                if (nextDate) {
                                    onDateCommit?.(format(nextDate, 'yyyy-MM-dd'));
                                }
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-1.5">
                <Label>{timeLabel}</Label>
                <TimePicker
                    value={time}
                    onChange={nextTime => emit(date, nextTime)}
                    allowManualInput
                    showTimeline={!!existingEvents?.length}
                    existingEvents={existingEvents}
                    placeholder="Время"
                    className="w-full"
                />
            </div>
        </div>
    );
};
