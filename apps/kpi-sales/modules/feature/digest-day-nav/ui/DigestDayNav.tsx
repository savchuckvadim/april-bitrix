'use client';

import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Calendar } from '@workspace/ui/components/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import { useDigestDayNav } from '../hooks/use-digest-day-nav';

/** «‹ ср, 14 октября 2026 ›» + календарь + «Сегодня». */
export const DigestDayNav = () => {
    const nav = useDigestDayNav();

    return (
        <div className="flex flex-wrap items-center gap-1">
            <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                aria-label="Предыдущий день"
                onClick={nav.goPrev}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={nav.open} onOpenChange={nav.setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-2 px-3 text-xs font-medium capitalize"
                    >
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        {nav.label}
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={nav.selected}
                        defaultMonth={nav.selected}
                        disabled={{ after: new Date() }}
                        onSelect={nav.pick}
                    />
                </PopoverContent>
            </Popover>

            <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                aria-label="Следующий день"
                disabled={!nav.canForward}
                onClick={nav.goNext}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            {!nav.isToday && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={nav.goToday}
                >
                    Сегодня
                </Button>
            )}
        </div>
    );
};
