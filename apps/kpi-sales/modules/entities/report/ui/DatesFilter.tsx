import React from 'react';
import { format} from 'date-fns';
import { ru } from 'date-fns/locale';
import { Label } from '@workspace/ui/components/label';
import { Calendar } from '@workspace/ui/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { useReport } from '../model/useReport';
import { ReportDateType } from '../model/types/report/report-type';


const DatesFilter: React.FC = () => {
    // const [dateFrom, setDateFrom] = React.useState<Date | undefined>();
    // const [dateTo, setDateTo] = React.useState<Date | undefined>();
    const [mounted, setMounted] = React.useState(false);
    const [showDateRange, setShowDateRange] = React.useState(false);
    const { date,
        handleDateChange


    } = useReport()
    const dateFrom = date[ReportDateType.FROM] ? new Date(date[ReportDateType.FROM]) : undefined
    const dateTo = date[ReportDateType.TO] ? new Date(date[ReportDateType.TO]) : undefined
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const getFormattedDate = (date: Date) => {
        if (!mounted) return '';
        return format(date, 'd MMMM yyyy г.', { locale: ru });
    };

    const handleLocalDateChange = (type: ReportDateType, date: Date | undefined) => {
        if (type === ReportDateType.FROM) {
            // setDateFrom(date);
            handleDateChange(ReportDateType.FROM, date?.toISOString() || '');
        } else {
            // setDateTo(date);
            handleDateChange(ReportDateType.TO, date?.toISOString() || '');
        }
    };

    // const handleQuickSelect = (type: 'today' | 'week' | 'month') => {
    //     const today = new Date();
    //     let from: Date;
    //     let to: Date;

    //     switch (type) {
    //         case 'today':
    //             from = today;
    //             to = today;
    //             break;
    //         case 'week':
    //             from = startOfWeek(today, { weekStartsOn: 1 });
    //             to = endOfWeek(today, { weekStartsOn: 1 });
    //             break;
    //         case 'month':
    //             from = startOfMonth(today);
    //             to = endOfMonth(today);
    //             break;
    //     }

    //     setDateFrom(from);
    //     setDateTo(to);
    //     onDateChange(ReportDateType.FROM, from.toISOString());
    //     onDateChange(ReportDateType.TO, to.toISOString());
    //     setShowDateRange(false);
    // };

    if (!mounted) {
        return null;
    }

    return (
        <div className="space-y-2">
            <Label>Период</Label>
            {/* {showDateRange && ( */}
            <div className="grid grid-cols-2 gap-2 mb-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full justify-start text-left font-normal text-sm cursor-pointer",
                                !dateFrom && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFrom ? getFormattedDate(dateFrom) : "От"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={dateFrom}
                            onSelect={(date) => handleLocalDateChange(ReportDateType.FROM, date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full justify-start text-left font-normal text-sm cursor-pointer",
                                !dateTo && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateTo ? getFormattedDate(dateTo) : "До"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={dateTo}
                            onSelect={(date) => handleLocalDateChange(ReportDateType.TO, date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            {/* )} */}

            {/* <RadioGroup defaultValue="today" className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="today" id="today" onClick={() => handleQuickSelect('today')} />
                    <Label htmlFor="today">Сегодня</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="week" id="week" onClick={() => handleQuickSelect('week')} />
                    <Label htmlFor="week">Текущая неделя</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="month" id="month" onClick={() => handleQuickSelect('month')} />
                    <Label htmlFor="month">Текущий месяц</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem
                        value="range"
                        id="range"
                        onClick={() => setShowDateRange(!showDateRange)}
                    />
                    <Label htmlFor="range">Диапазон дат</Label>
                </div>
            </RadioGroup> */}


        </div>
    );
};

export default DatesFilter; 