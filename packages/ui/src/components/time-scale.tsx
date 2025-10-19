'use client';

import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';

export interface TimeScaleEvent {
    time: string;
    title: string;
    type: string;
    contact?: string;
    color?: string;
}

export interface TimeScaleProps {
    value?: string;
    onChange?: (time: string) => void;
    existingEvents?: TimeScaleEvent[];
    selectedDate?: Date;
    className?: string;
    height?: number;
    showHours?: boolean;
    step?: number; // в минутах
}

const TimeScale = React.forwardRef<HTMLDivElement, TimeScaleProps>(
    (
        {
            value = '',
            onChange,
            existingEvents = [],
            selectedDate = new Date(),
            className,
            height = 200,
            showHours = true,
            step = 15, // 15 минут
            ...props
        },
        ref
    ) => {
        const [isDragging, setIsDragging] = React.useState(false);
        const [hoverTime, setHoverTime] = React.useState<string | null>(null);
        const scaleRef = React.useRef<HTMLDivElement>(null);

        // Цвета для разных типов событий
        const getEventColor = (type: string) => {
            const colors = {
                call: '#3b82f6', // blue
                presentation: '#8b5cf6', // purple
                decision_call: '#10b981', // emerald
                payment_call: '#f59e0b', // amber
                post_sale_call: '#ef4444', // red
                default: '#6b7280' // gray
            };
            return colors[type as keyof typeof colors] || colors.default;
        };

        // Генерируем временные метки
        const timeLabels = React.useMemo(() => {
            const labels = [];
            for (let hour = 0; hour < 24; hour++) {
                for (let minute = 0; minute < 60; minute += step) {
                    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    labels.push({
                        time,
                        position: (hour * 60 + minute) / (24 * 60) * 100,
                        isHour: minute === 0
                    });
                }
            }
            return labels;
        }, [step]);

        // Конвертируем события в позиции на шкале
        const eventPositions = React.useMemo(() => {
            return existingEvents.map(event => {
                const [h, m] = event.time.split(':').map(Number);
                const position = ((h || 0) * 60 + (m || 0)) / (24 * 60) * 100;
                return {
                    ...event,
                    position
                };
            });
        }, [existingEvents]);

        // Получаем время из позиции мыши
        const getTimeFromPosition = (clientX: number) => {
            if (!scaleRef.current) return null;

            const rect = scaleRef.current.getBoundingClientRect();
            const x = clientX - rect.left;
            const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
            const totalMinutes = Math.round((percentage / 100) * (24 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = Math.floor((totalMinutes % 60) / step) * step;

            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        };

        // Обработчики мыши
        const handleMouseDown = (e: React.MouseEvent) => {
            if (e.button !== 0) return; // только левая кнопка мыши

            setIsDragging(true);
            const time = getTimeFromPosition(e.clientX);
            if (time) {
                onChange?.(time);
            }
        };

        const handleMouseMove = (e: React.MouseEvent) => {
            const time = getTimeFromPosition(e.clientX);
            setHoverTime(time);

            if (isDragging && time) {
                onChange?.(time);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        const handleMouseLeave = () => {
            setHoverTime(null);
            setIsDragging(false);
        };

        // Получаем позицию выбранного времени
        const selectedPosition = React.useMemo(() => {
            if (!value) return null;
            const [h, m] = value.split(':').map(Number);
            return ((h || 0) * 60 + (m || 0)) / (24 * 60) * 100;
        }, [value]);

        return (
            <div
                ref={ref}
                className={cn('relative select-none', className)}
                {...props}
            >
                {/* Заголовок */}
                <div className="mb-2">
                    <h3 className="text-sm font-medium text-foreground">
                        Временная шкала на {selectedDate.toLocaleDateString('ru-RU')} (24 часа)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Кликните на шкале для выбора времени • Событий: {existingEvents.length}
                    </p>
                </div>

                {/* Контейнер шкалы */}
                <div
                    ref={scaleRef}
                    className="relative border border-border rounded-lg bg-background cursor-pointer"
                    style={{ height: `${height}px` }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Фоновая сетка */}
                    <div className="absolute inset-0">
                        {timeLabels.map((label, index) => (
                            <div
                                key={index}
                                className="absolute top-0 bottom-0 w-px bg-border"
                                style={{ left: `${label.position}%` }}
                            />
                        ))}
                    </div>

                    {/* Временные метки - вертикальное расположение */}
                    {showHours && (
                        <div className="absolute inset-0">
                            {timeLabels
                                .filter(label => label.isHour)
                                .map((label, index) => {
                                    // Размещаем метки вертикально - чередуем сверху и снизу
                                    const isEven = index % 2 === 0;

                                    return (!index ? null :
                                        <div
                                            key={index}
                                            className={cn(
                                                "absolute text-xs text-muted-foreground font-medium px-1",
                                                isEven ? "top-2" : "bottom-2"
                                            )}
                                            style={{ left: `${label.position}%`, transform: 'translateX(-50%)' }}
                                        >
                                            {label.time}
                                        </div>
                                    );
                                })}
                        </div>
                    )}

                    {/* Существующие события */}
                    {eventPositions.map((event, index) => (
                        <div
                            key={index}
                            className="absolute top-7 bottom-7 w-2 rounded-full cursor-pointer hover:w-3 transition-all duration-200"
                            style={{
                                left: `${event.position}%`,
                                backgroundColor: event.color || getEventColor(event.type)
                            }}
                            title={`${event.time} - ${event.title}${event.contact ? ` (${event.contact})` : ''} - ${event.type}`}
                        />
                    ))}

                    {/* Выбранное время */}
                    {selectedPosition !== null && (
                        <div
                            className="absolute top-1 bottom-1 w-1 bg-blue-500 rounded-full z-10"
                            style={{ left: `${selectedPosition}%` }}
                        />
                    )}

                    {/* Индикатор при наведении */}
                    {hoverTime && (
                        <div
                            className="absolute top-1 bottom-1 w-0.5 bg-gray-400 rounded-full z-20"
                            style={{
                                left: `${((parseInt(hoverTime.split(':')[0] || '0') * 60 + parseInt(hoverTime.split(':')[1] || '0')) / (24 * 60)) * 100}%`
                            }}
                        />
                    )}

                    {/* Центральная линия */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />

                    {/* Время при наведении */}
                    {hoverTime && (
                        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 -translate-y-full bg-foreground text-background text-xs px-2 py-1 rounded shadow-lg z-30">
                            {hoverTime}
                        </div>
                    )}
                </div>

                {/* Легенда */}
                <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            <span>Выбранное время</span>
                        </div>
                    </div>

                    {existingEvents.length > 0 && (
                        <div className="text-xs">
                            <div className="font-medium mb-1">Типы событий:</div>
                            <div className="flex flex-wrap gap-3">
                                {Array.from(new Set(existingEvents.map(e => e.type))).map(type => (
                                    <div key={type} className="flex items-center gap-1">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: getEventColor(type) }}
                                        />
                                        <span className="capitalize">{type.replace('_', ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Информация о выбранном времени */}
                {value && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <strong>Выбранное время:</strong> {value}
                    </div>
                )}
            </div>
        );
    }
);

TimeScale.displayName = 'TimeScale';

export { TimeScale };
