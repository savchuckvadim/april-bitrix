import { Button } from "@workspace/ui/components/button"
import { useReportType } from "../hooks/report-type.hook";
import { EReportType, REPORT_TYPE_LABELS } from "../consts/report-type.consts";

export const ReportType = () => {
    const { current, setCurrentReportType } = useReportType();
    return (
        <div className="flex items-center gap-2 p-0 m-0">
            {
                Object.values(EReportType).map((type) => (
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
