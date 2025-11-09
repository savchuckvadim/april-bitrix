'use client'

import React, { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { IUserReportItem } from "../../type/user-report.type";
import { BarChart3, Table } from 'lucide-react';

Chart.register(...registerables);

// Функция для парсинга даты в формате DD.MM.YYYY HH:mm:ss
const parseCustomDate = (dateString: string): Date | null => {
    try {
        // Парсим формат DD.MM.YYYY HH:mm:ss
        const match = dateString.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
        if (!match) return null;

        const [, day, month, year, hour, minute, second] = match;
        const date = new Date(
            parseInt(year || '0'),
            parseInt(month || '1') - 1, // месяцы в JS начинаются с 0
            parseInt(day || '1'),
            parseInt(hour || '0'),
            parseInt(minute || '0'),
            parseInt(second || '0')
        );

        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
};

interface UserReportChartProps {
    report: IUserReportItem[];
    selectedFilters: {
        action?: string;
        type?: string;
        initiative?: string;
        communication?: string;
    };
    groupByCompany: boolean;
}

interface TimeSegment {
    label: string;
    start: Date;
    end: Date;
}

interface EventTypeData {
    action: string;
    type: string;
    label: string;
    color: string;
    data: number[];
}

const TIME_SCALES = [
    { key: 'day', label: 'День', days: 1 },
    { key: 'week', label: 'Неделя', days: 7 },
    { key: 'month', label: 'Месяц', days: 30 },
    { key: 'quarter', label: 'Квартал', days: 90 },
    { key: 'year', label: 'Год', days: 365 }
];

const COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export const UserReportChart: React.FC<UserReportChartProps> = ({
    report,
    selectedFilters,
    groupByCompany
}) => {
    const [timeScale, setTimeScale] = useState('month');
    const [enabledEventTypes, setEnabledEventTypes] = useState<Set<string>>(new Set());

    // Фильтрация данных
    const filteredData = useMemo(() => {
        return report.filter(item => {
            if (selectedFilters.action && item.sales_kpi_event_action?.value?.code !== selectedFilters.action) {
                return false;
            }
            if (selectedFilters.type && item.sales_kpi_event_type?.value?.code !== selectedFilters.type) {
                return false;
            }

            return true;
        });
    }, [report, selectedFilters]);

    // Определение доступных масштабов на основе данных
    const availableScales = useMemo(() => {
        if (filteredData.length === 0) return TIME_SCALES;

        const dates = filteredData
            .map(item => {
                const dateValue = item.sales_kpi_event_date?.value?.value;
                if (!dateValue) return null;

                return parseCustomDate(dateValue);
            })
            .filter((date): date is Date => date !== null)
            .sort((a, b) => a.getTime() - b.getTime());

        if (dates.length === 0) return TIME_SCALES;

        const timeSpan = (dates[dates.length - 1]?.getTime() || 0) - (dates[0]?.getTime() || 0);
        const daysSpan = timeSpan / (1000 * 60 * 60 * 24);

        console.log('Chart debug:', {
            totalEvents: filteredData.length,
            datesCount: dates.length,
            firstDate: dates[0]?.toISOString(),
            lastDate: dates[dates.length - 1]?.toISOString(),
            daysSpan: Math.round(daysSpan),
            timeSpan: Math.round(timeSpan / (1000 * 60 * 60 * 24)) + ' days',
            sampleDates: filteredData.slice(0, 3).map(item => ({
                original: item.sales_kpi_event_date?.value?.value,
                parsed: parseCustomDate(item.sales_kpi_event_date?.value?.value || '')?.toISOString()
            }))
        });

        // Определяем какие масштабы имеют смысл для данных
        const scales = TIME_SCALES.filter(scale => {
            // Всегда показываем все масштабы - пользователь сам выберет подходящий
            return true;
        });

        return scales.length > 0 ? scales : TIME_SCALES;
    }, [filteredData]);

    // Определение временного масштаба
    const timeScaleInfo = useMemo(() => {
        if (filteredData.length === 0) return TIME_SCALES[2]; // месяц по умолчанию

        // Если пользователь выбрал масштаб вручную и он доступен, используем его
        const selectedScale = availableScales.find(scale => scale.key === timeScale);
        if (selectedScale) return selectedScale;

        // Иначе автоматически определяем масштаб
        const dates = filteredData
            .map(item => {
                const dateValue = item.sales_kpi_event_date?.value?.value;
                if (!dateValue) return null;

                return parseCustomDate(dateValue);
            })
            .filter((date): date is Date => date !== null)
            .sort((a, b) => a.getTime() - b.getTime());

        if (dates.length === 0) return TIME_SCALES[2];

        const timeSpan = (dates[dates.length - 1]?.getTime() || 0) - (dates[0]?.getTime() || 0);
        const daysSpan = timeSpan / (1000 * 60 * 60 * 24);

        if (daysSpan <= 7) return TIME_SCALES[0]; // день
        if (daysSpan <= 30) return TIME_SCALES[1]; // неделя
        if (daysSpan <= 90) return TIME_SCALES[2]; // месяц
        if (daysSpan <= 365) return TIME_SCALES[3]; // квартал
        return TIME_SCALES[4]; // год
    }, [filteredData, timeScale, availableScales]);

    // Создание временных сегментов
    const timeSegments = useMemo((): TimeSegment[] => {
        if (filteredData.length === 0) return [];

        const dates = filteredData
            .map(item => {
                // Используем дату события
                const dateValue = item.sales_kpi_event_date?.value?.value;
                if (!dateValue) return null;

                return parseCustomDate(dateValue);
            })
            .filter((date): date is Date => date !== null)
            .sort((a, b) => a.getTime() - b.getTime());

        if (dates.length === 0) return [];

        const startDate = dates[0];
        const endDate = dates[dates.length - 1];
        const segments: TimeSegment[] = [];

        if (!startDate || !endDate || !timeScaleInfo) return segments;

        const current = new Date(startDate);
        while (current <= endDate) {
            const segmentEnd = new Date(current);
            segmentEnd.setDate(segmentEnd.getDate() + timeScaleInfo.days);

            let label = '';
            switch (timeScaleInfo.key) {
                case 'day':
                    label = current.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
                    break;
                case 'week':
                    label = `Неделя ${Math.ceil((current.getTime() - (startDate?.getTime() || 0)) / (7 * 24 * 60 * 60 * 1000)) + 1}`;
                    break;
                case 'month':
                    label = current.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
                    break;
                case 'quarter':
                    const quarter = Math.floor(current.getMonth() / 3) + 1;
                    label = `Q${quarter} ${current.getFullYear()}`;
                    break;
                case 'year':
                    label = current.getFullYear().toString();
                    break;
            }

            segments.push({
                label: label || 'Период',
                start: new Date(current),
                end: new Date(segmentEnd)
            });

            current.setDate(current.getDate() + (timeScaleInfo?.days || 1));
        }

        return segments;
    }, [filteredData, timeScaleInfo]);

    // Отладка временных сегментов
    React.useEffect(() => {
        console.log('Time segments debug:', {
            segmentsCount: timeSegments.length,
            segments: timeSegments.map(s => ({
                label: s.label,
                start: s.start.toISOString(),
                end: s.end.toISOString()
            }))
        });
    }, [timeSegments]);

    // Группировка событий по типам
    const eventTypes = useMemo((): EventTypeData[] => {
        const typeMap = new Map<string, EventTypeData>();

        filteredData.forEach(item => {
            const action = item.sales_kpi_event_action?.value?.name || 'Неизвестно';
            const type = item.sales_kpi_event_type?.value?.name || 'Неизвестно';
            const key = `${action} - ${type}`;

            if (!typeMap.has(key)) {
                const colorIndex = typeMap.size % COLORS.length;
                typeMap.set(key, {
                    action,
                    type,
                    label: key,
                    color: COLORS[colorIndex] || '#000000',
                    data: new Array(timeSegments.length).fill(0)
                });
            }

            const dateValue = item.sales_kpi_event_date?.value?.value;
            if (!dateValue) return; // Пропускаем события без даты

            const eventDate = parseCustomDate(dateValue);
            if (!eventDate) return; // Пропускаем невалидные даты
            const segmentIndex = timeSegments.findIndex(segment =>
                eventDate >= segment.start && eventDate < segment.end
            );

            if (segmentIndex !== -1) {
                const eventType = typeMap.get(key);
                if (eventType && eventType.data[segmentIndex] !== undefined) {
                    eventType.data[segmentIndex]++;
                }
            }
        });

        return Array.from(typeMap.values());
    }, [filteredData, timeSegments]);

    // Отладка типов событий
    React.useEffect(() => {
        console.log('Event types debug:', {
            typesCount: eventTypes.length,
            types: eventTypes.map(et => ({
                label: et.label,
                data: et.data,
                totalEvents: et.data.reduce((sum, count) => sum + count, 0)
            }))
        });
    }, [eventTypes]);

    // Инициализация включенных типов событий
    React.useEffect(() => {
        if (eventTypes.length > 0 && enabledEventTypes.size === 0) {
            setEnabledEventTypes(new Set(eventTypes.map(et => et.label)));
        }
    }, [eventTypes, enabledEventTypes.size]);

    // Данные для графика
    const chartData = useMemo(() => {
        const enabledTypes = eventTypes.filter(et => enabledEventTypes.has(et.label));

        return {
            labels: timeSegments.map(segment => segment.label),
            datasets: enabledTypes.map(eventType => ({
                label: eventType.label,
                data: eventType.data,
                borderColor: eventType.color,
                backgroundColor: eventType.color + '20',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            }))
        };
    }, [eventTypes, enabledEventTypes, timeSegments]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: `События по ${timeScaleInfo?.label.toLowerCase() || 'периодам'}ам`
            },
            legend: {
                display: true,
                position: 'top' as const
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Период'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Количество событий'
                },
                beginAtZero: true
            }
        }
    };

    const toggleEventType = (eventLabel: string) => {
        const newEnabled = new Set(enabledEventTypes);
        if (newEnabled.has(eventLabel)) {
            newEnabled.delete(eventLabel);
        } else {
            newEnabled.add(eventLabel);
        }
        setEnabledEventTypes(newEnabled);
    };

    if (filteredData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>График событий</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500 text-center py-8">Нет данных для отображения</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>График событий</CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Масштаб:</span>
                        {availableScales.map(scale => (
                            <Button
                                key={scale.key}
                                variant={timeScale === scale.key ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTimeScale(scale.key)}
                            >
                                {scale.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Фильтр типов событий */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Типы событий:</h4>
                    <div className="flex flex-wrap gap-2">
                        {eventTypes.map(eventType => (
                            <Badge
                                key={eventType.label}
                                variant={enabledEventTypes.has(eventType.label) ? "default" : "secondary"}
                                className="cursor-pointer hover:opacity-80"
                                style={{ backgroundColor: enabledEventTypes.has(eventType.label) ? eventType.color : undefined }}
                                onClick={() => toggleEventType(eventType.label)}
                            >
                                {eventType.label}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* График */}
                <div className="h-96">
                    <Line data={chartData} options={chartOptions} />
                </div>

                {/* Статистика */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
                        <div className="text-sm text-gray-500">Всего событий</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{eventTypes.length}</div>
                        <div className="text-sm text-gray-500">Типов событий</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{timeSegments.length}</div>
                        <div className="text-sm text-gray-500">Периодов</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {Math.round(filteredData.length / timeSegments.length)}
                        </div>
                        <div className="text-sm text-gray-500">Среднее за период</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
