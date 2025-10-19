'use client';

import * as React from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';

export interface TimePickerProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    format?: '24h' | '12h';
    showSeconds?: boolean;
    step?: number;
    allowManualInput?: boolean;
    showTimeline?: boolean;
    existingEvents?: Array<{ time: string; title: string; type: string }>;
}

const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
    (
        {
            value = '',
            onChange,
            placeholder = 'Выберите время',
            disabled = false,
            className,
            size = 'md',
            format = '24h',
            showSeconds = false,
            step = 1,
            allowManualInput = true,
            showTimeline = false,
            existingEvents = [],
            ...props
        },
        ref
    ) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [isManualInput, setIsManualInput] = React.useState(false);
        const [manualInputValue, setManualInputValue] = React.useState(value);
        const [time, setTime] = React.useState(() => {
            if (!value) return { hours: 0, minutes: 0, seconds: 0 };
            const [h, m, s = 0] = value.split(':').map(Number);
            return { hours: h || 0, minutes: m || 0, seconds: s || 0 };
        });

        const sizeClasses = {
            sm: 'h-8 px-3 text-sm',
            md: 'h-10 px-4 text-sm',
            lg: 'h-12 px-6 text-base',
        };

        const formatTime = (hours: number, minutes: number, seconds: number) => {
            if (format === '12h') {
                const period = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                const timeStr = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                return showSeconds
                    ? `${timeStr}:${seconds.toString().padStart(2, '0')} ${period}`
                    : `${timeStr} ${period}`;
            }

            const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            return showSeconds
                ? `${timeStr}:${seconds.toString().padStart(2, '0')}`
                : timeStr;
        };

        const handleTimeChange = (newTime: { hours: number; minutes: number; seconds: number }) => {
            setTime(newTime);
            const timeString = `${newTime.hours.toString().padStart(2, '0')}:${newTime.minutes.toString().padStart(2, '0')}${showSeconds ? `:${newTime.seconds.toString().padStart(2, '0')}` : ''}`;
            onChange?.(timeString);
        };

        const handleManualInput = (inputValue: string) => {
            setManualInputValue(inputValue);
            // Простая валидация времени HH:MM или HH:MM:SS
            const timeRegex = showSeconds ? /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/ : /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (timeRegex.test(inputValue)) {
                const [h, m, s = 0] = inputValue.split(':').map(Number);
                const newTime = { hours: h || 0, minutes: m || 0, seconds: s || 0 };
                setTime(newTime);
                onChange?.(inputValue);
            }
        };

        const handleManualInputBlur = () => {
            if (manualInputValue && manualInputValue !== value) {
                handleManualInput(manualInputValue);
            }
            setIsManualInput(false);
        };

        const getTimelineEvents = () => {
            if (!showTimeline || existingEvents.length === 0) return [];

            return existingEvents
                .map(event => {
                    const [h, m] = event.time.split(':').map(Number);
                    return {
                        ...event,
                        minutesFromMidnight: (h || 0) * 60 + (m || 0)
                    };
                })
                .sort((a, b) => a.minutesFromMidnight - b.minutesFromMidnight);
        };

        const handleHoursChange = (hours: number) => {
            const newTime = { ...time, hours };
            handleTimeChange(newTime);
        };

        const handleMinutesChange = (minutes: number) => {
            const newTime = { ...time, minutes };
            handleTimeChange(newTime);
        };

        const handleSecondsChange = (seconds: number) => {
            const newTime = { ...time, seconds };
            handleTimeChange(newTime);
        };

        const quickTimes = [
            { label: '09:00', hours: 9, minutes: 0 },
            { label: '10:00', hours: 10, minutes: 0 },
            { label: '11:00', hours: 11, minutes: 0 },
            { label: '12:00', hours: 12, minutes: 0 },
            { label: '13:00', hours: 13, minutes: 0 },
            { label: '14:00', hours: 14, minutes: 0 },
            { label: '15:00', hours: 15, minutes: 0 },
            { label: '16:00', hours: 16, minutes: 0 },
            { label: '17:00', hours: 17, minutes: 0 },
            { label: '18:00', hours: 18, minutes: 0 },
        ];

        const generateTimeOptions = (max: number, step: number = 1) => {
            return Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step);
        };

        const hoursOptions = format === '12h'
            ? generateTimeOptions(23, step).map(h => h === 0 ? 12 : h > 12 ? h - 12 : h)
            : generateTimeOptions(23, step);

        const minutesOptions = generateTimeOptions(59, step);
        const secondsOptions = generateTimeOptions(59, step);

        const displayValue = value ? formatTime(time.hours, time.minutes, time.seconds) : placeholder;
        const timelineEvents = getTimelineEvents();

        return (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        ref={ref}
                        variant="outline"
                        className={cn(
                            'justify-start text-left font-normal',
                            sizeClasses[size],
                            !value && 'text-muted-foreground',
                            className
                        )}
                        disabled={disabled}
                        {...props}
                    >
                        <Clock className="mr-2 h-4 w-4 shrink-0" />
                        {isManualInput ? (
                            <input
                                type="text"
                                value={manualInputValue}
                                onChange={(e) => handleManualInput(e.target.value)}
                                onBlur={handleManualInputBlur}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleManualInputBlur();
                                    }
                                    if (e.key === 'Escape') {
                                        setIsManualInput(false);
                                        setManualInputValue(value);
                                    }
                                }}
                                className="bg-transparent border-none outline-none flex-1 min-w-0"
                                placeholder={placeholder}
                                autoFocus
                            />
                        ) : (
                            <span
                                className="flex-1 cursor-text"
                                onDoubleClick={() => setIsManualInput(true)}
                                title="Двойной клик для ручного ввода"
                            >
                                {displayValue}
                            </span>
                        )}
                        <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4">
                        {/* Ручной ввод */}
                        {allowManualInput && (
                            <div className="mb-4">
                                <div className="text-sm font-medium text-foreground mb-2">Ручной ввод</div>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        value={manualInputValue}
                                        onChange={(e) => setManualInputValue(e.target.value)}
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                            if (e.key === 'Enter') {
                                                handleManualInput(manualInputValue);
                                                setIsOpen(false);
                                            }
                                        }}
                                        placeholder={showSeconds ? "HH:MM:SS" : "HH:MM"}
                                        className="h-8 text-xs"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            handleManualInput(manualInputValue);
                                            setIsOpen(false);
                                        }}
                                        className="h-8 px-3"
                                    >
                                        OK
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Временная шкала */}
                        {showTimeline && timelineEvents.length > 0 && (
                            <div className="mb-4">
                                <div className="text-sm font-medium text-foreground mb-2">Запланированные события</div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {timelineEvents.map((event, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                                        >
                                            <span className="font-medium">{event.time}</span>
                                            <span className="text-gray-600 truncate ml-2">{event.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Быстрый выбор времени */}
                        <div className="mb-4">
                            <div className="text-sm font-medium text-foreground mb-2">Популярное время</div>
                            <div className="grid grid-cols-5 gap-1">
                                {quickTimes.map((quickTime) => (
                                    <Button
                                        key={quickTime.label}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => {
                                            handleTimeChange({
                                                hours: quickTime.hours,
                                                minutes: quickTime.minutes,
                                                seconds: 0
                                            });
                                            setIsOpen(false);
                                        }}
                                    >
                                        {quickTime.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Кастомный выбор времени */}
                        <div className="border-t pt-4">
                            <div className="text-sm font-medium text-foreground mb-3">Выберите время</div>
                            <div className="flex items-center space-x-6">
                                {/* Часы */}
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="text-xs font-medium text-muted-foreground">Часы</div>
                                    <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                        {hoursOptions.map((hour) => (
                                            <Button
                                                key={hour}
                                                variant={time.hours === hour ? 'default' : 'ghost'}
                                                size="sm"
                                                className="h-8 w-16 text-xs"
                                                onClick={() => handleHoursChange(hour)}
                                            >
                                                {hour.toString().padStart(2, '0')}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Минуты */}
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="text-xs font-medium text-muted-foreground">Минуты</div>
                                    <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                        {minutesOptions.map((minute) => (
                                            <Button
                                                key={minute}
                                                variant={time.minutes === minute ? 'default' : 'ghost'}
                                                size="sm"
                                                className="h-8 w-12 text-xs"
                                                onClick={() => handleMinutesChange(minute)}
                                            >
                                                {minute.toString().padStart(2, '0')}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Секунды (если включены) */}
                                {showSeconds && (
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="text-xs font-medium text-muted-foreground">Секунды</div>
                                        <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                            {secondsOptions.map((second) => (
                                                <Button
                                                    key={second}
                                                    variant={time.seconds === second ? 'default' : 'ghost'}
                                                    size="sm"
                                                    className="h-8 w-12 text-xs"
                                                    onClick={() => handleSecondsChange(second)}
                                                >
                                                    {second.toString().padStart(2, '0')}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Кнопки действий */}
                        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                            >
                                Отмена
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setIsOpen(false)}
                            >
                                Готово
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        );
    }
);

TimePicker.displayName = 'TimePicker';

export { TimePicker };
