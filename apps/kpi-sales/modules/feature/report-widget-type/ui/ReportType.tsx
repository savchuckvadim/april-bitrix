import { Button } from "@workspace/ui/components/button"
import { useReportType } from "../hooks/report-type.hook";
import { useEnsureAvailableReportType } from "../hooks/use-available-report-types";
import { REPORT_TYPE_LABELS } from "../consts/report-type.consts";

/**
 * Переключатель вкладок отчёта. Список — только доступные текущему
 * пользователю (централизованные права: shared/access + useAccess);
 * недоступная сохранённая вкладка автоматически уводится на «Все».
 */
export const ReportType = () => {
    const { current, setCurrentReportType } = useReportType();
    const available = useEnsureAvailableReportType();
    return (
        <div className="flex items-center gap-2 p-0 m-0">
            {
                available.map((type) => (
                    <Button
                        key={type}
                        variant={current === type ? "default" : "outline"}
                        className="text-xs h-6 px-2"
                        onClick={() => setCurrentReportType(type)}
                    >
                        {REPORT_TYPE_LABELS[type]}
                    </Button>
                ))
            }

        </div>
    )
}
