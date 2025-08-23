import React from "react";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ru } from "date-fns/locale";
import { Label } from "@workspace/ui/components/label";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useReport } from "../model/useReport";
import {
  EReportDateMode,
  ReportDateType,
} from "../model/types/report/report-type";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";

const DatesFilter: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);
  const { date, handleDateChange, handleDateModeChange } = useReport();
  const [showDateRange, setShowDateRange] = React.useState(
    date.mode === EReportDateMode.RANGE,
  );

  const dateFrom = date[ReportDateType.FROM]
    ? new Date(date[ReportDateType.FROM])
    : undefined;
  const dateTo = date[ReportDateType.TO]
    ? new Date(date[ReportDateType.TO])
    : undefined;
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getFormattedDate = (date: Date) => {
    if (!mounted) return "";
    return format(date, "d MMMM yyyy г.", { locale: ru });
  };

  const handleLocalDateChange = (
    type: ReportDateType,
    date: Date | undefined,
  ) => {
    if (type === ReportDateType.FROM) {
      // setDateFrom(date);
      handleDateChange(ReportDateType.FROM, date?.toISOString() || "");
    } else {
      // setDateTo(date);
      handleDateChange(ReportDateType.TO, date?.toISOString() || "");
    }
  };

  const handleQuickSelect = (type: EReportDateMode) => {
    handleDateModeChange(type);
    setShowDateRange(false);
  };

  if (!mounted) {
    return null;
  }
  const setDiapasonRangeMode = () => {
    handleDateModeChange(EReportDateMode.RANGE);
    setShowDateRange(true);
  };

  return (
    <div className="mb-5">
      {" "}
      <Label className="mb-2">Период</Label>
      <div className="min-h-[60px] mt-5 flex flex-col xl:flex-row gap-2">
        <RadioGroup
          defaultValue={date.mode}
          className={`order-2 xl:order-1 flex flex-col flex-wrap  gap-2`}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              className="cursor-pointer"
              value={EReportDateMode.RANGE}
              id={EReportDateMode.RANGE}
              onClick={() => setDiapasonRangeMode()}
            />
            <Label htmlFor={EReportDateMode.RANGE}>Диапазон</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              className="cursor-pointer"
              value={EReportDateMode.TODAY}
              id={EReportDateMode.TODAY}
              onClick={() => handleQuickSelect(EReportDateMode.TODAY)}
            />
            <Label htmlFor={EReportDateMode.TODAY}>Сегодня</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              className="cursor-pointer"
              value={EReportDateMode.WEEK}
              id={EReportDateMode.WEEK}
              onClick={() => handleQuickSelect(EReportDateMode.WEEK)}
            />
            <Label htmlFor={EReportDateMode.WEEK}>Hеделя</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              className="cursor-pointer"
              value={EReportDateMode.MONTH}
              id={EReportDateMode.MONTH}
              onClick={() => handleQuickSelect(EReportDateMode.MONTH)}
            />
            <Label htmlFor={EReportDateMode.MONTH}>Месяц</Label>
          </div>
        </RadioGroup>

        <div className="order-1 xl:order-2  w-full mt-3 xl:mt-0 xl:ml-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={!showDateRange}
                className={cn(
                  "w-full justify-start text-left font-normal text-sm cursor-pointer",
                  !dateFrom && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? getFormattedDate(dateFrom) : "От"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                locale={ru}
                mode="single"
                selected={dateFrom}
                onSelect={(date) =>
                  handleLocalDateChange(ReportDateType.FROM, date)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={!showDateRange}
                className={cn(
                  "w-full justify-start text-left font-normal text-sm cursor-pointer",
                  !dateTo && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? getFormattedDate(dateTo) : "До"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                className="cursor-pointer"
                locale={ru}
                mode="single"
                selected={dateTo}
                onSelect={(date) =>
                  handleLocalDateChange(ReportDateType.TO, date)
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
