import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Label } from '@workspace/ui/components/label';
import { Calendar } from '@workspace/ui/components/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { CalendarIcon } from 'lucide-react';
import {
    EReportDateMode,
    ReportDateType,
    ReportPeriod,
} from '../model/types/report/report-type';
import { DATE_MODE_OPTIONS, parseDateMode } from '../lib/date-mode-options';
import {
    RadioGroup,
    RadioGroupItem,
} from '@workspace/ui/components/radio-group';

interface DatesFilterProps {
    /** Показываемый период: режим и обе даты (yyyy-MM-dd). */
    date: ReportPeriod;
    /** Дата выбрана в календаре (значение — ISO-строка или пустая, если сброшена). */
    onDateChange: (type: ReportDateType, value: string) => void;
    /** Выбран режим периода (диапазон, сегодня, неделя, месяц). */
    onModeChange: (mode: EReportDateMode) => void;
}

/**
 * Период отчёта: режим и календари. Компонент управляемый — значения и
 * обработчики приходят снаружи, в состояние отчёта он не пишет.
 */
const DatesFilter: React.FC<DatesFilterProps> = ({
    date,
    onDateChange,
    onModeChange,
}) => {
    const [mounted, setMounted] = React.useState(false);
    const isRange = date.mode === EReportDateMode.RANGE;

    const dateFrom = date[ReportDateType.FROM]
        ? new Date(date[ReportDateType.FROM])
        : undefined;
    const dateTo = date[ReportDateType.TO]
        ? new Date(date[ReportDateType.TO])
        : undefined;
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const getFormattedDate = (value: Date) => {
        if (!mounted) return '';
        return format(value, 'd MMMM yyyy г.', { locale: ru });
    };

    const handleCalendarSelect = (
        type: ReportDateType,
        value: Date | undefined,
    ) => {
        onDateChange(type, value?.toISOString() || '');
    };

    const handleModeValueChange = (value: string) => {
        const mode = parseDateMode(value);
        if (mode) onModeChange(mode);
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="mb-5">
            {' '}
            <Label className="mb-2">Период</Label>
            <div className="min-h-[60px] mt-5 flex flex-col xl:flex-row gap-2">
                <RadioGroup
                    value={date.mode}
                    onValueChange={handleModeValueChange}
                    className={`order-2 xl:order-1 flex flex-col flex-wrap  gap-2`}
                >
                    {DATE_MODE_OPTIONS.map(option => (
                        <div
                            key={option.mode}
                            className="flex items-center space-x-2"
                        >
                            <RadioGroupItem
                                className="cursor-pointer"
                                value={option.mode}
                                id={option.mode}
                            />
                            <Label htmlFor={option.mode}>{option.label}</Label>
                        </div>
                    ))}
                </RadioGroup>

                <div className="order-1 xl:order-2  w-full mt-3 xl:mt-0 xl:ml-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                disabled={!isRange}
                                className={cn(
                                    'w-full justify-start text-left font-normal text-sm cursor-pointer',
                                    !dateFrom && 'text-muted-foreground',
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateFrom ? getFormattedDate(dateFrom) : 'От'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                locale={ru}
                                mode="single"
                                selected={dateFrom}
                                // Открываться на месяце выбранной даты, а не на сегодняшнем
                                defaultMonth={dateFrom}
                                onSelect={value =>
                                    handleCalendarSelect(
                                        ReportDateType.FROM,
                                        value,
                                    )
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                disabled={!isRange}
                                className={cn(
                                    'w-full justify-start text-left font-normal text-sm cursor-pointer',
                                    !dateTo && 'text-muted-foreground',
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateTo ? getFormattedDate(dateTo) : 'До'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                className="cursor-pointer"
                                locale={ru}
                                mode="single"
                                selected={dateTo}
                                // Открываться на месяце выбранной даты, а не на сегодняшнем
                                defaultMonth={dateTo}
                                onSelect={value =>
                                    handleCalendarSelect(
                                        ReportDateType.TO,
                                        value,
                                    )
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
};

export default DatesFilter;
