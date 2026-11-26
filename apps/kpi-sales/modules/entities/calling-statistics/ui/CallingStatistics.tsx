import CallingTable from './components/CallingTable';
import { ChartsGate, Preloader } from '@/modules/shared';
import CallingDashboard from './components/CallingDashboard';
import { ReportCallingData } from '../type/calling-type';
import type { RTableAnnotation } from '@workspace/april-ui';
import type { IndicatorLabeler } from '@/modules/shared/lib/indicator-labels';
import type { TableRowsDecorator } from '@/modules/shared/lib/table-decorators';

interface CallingStatisticsProps {
    callingsReport: ReportCallingData[] | null | undefined;
    isLoading: boolean;
    /** Аннотации ячеек таблицы (% конверсий). */
    annotations?: Map<string, RTableAnnotation>;
    /** План-аннотации («⌖ план · %») — отдельная подстрока. */
    planAnnotations?: Map<string, RTableAnnotation>;
    /** Выводимые названия бакетов (таблица и график). */
    labelOf?: IndicatorLabeler;
    /** Дополнение строк таблицы колонками (колонки планов слева от факта). */
    withPlanColumns?: TableRowsDecorator;
}
const CallingStatistics: React.FC<CallingStatisticsProps> = ({
    callingsReport,
    isLoading,
    annotations,
    planAnnotations,
    labelOf,
    withPlanColumns,
}) => {
    if (isLoading)
        return (
            <div className="min-w-full h-[500px] flex justify-center items-center">
                <Preloader size="lg" />
            </div>
        );
    if (!callingsReport) return null;
    if (!callingsReport.length) return null;
    return (
        <div className="w-full h-full">
            <div className="mt-5 p-1 flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary">
                    Статистика по звонкам
                </h2>
            </div>
            <CallingTable
                data={callingsReport}
                annotations={annotations}
                planAnnotations={planAnnotations}
                labelOf={labelOf}
                withPlanColumns={withPlanColumns}
            />
            <ChartsGate>
                <CallingDashboard report={callingsReport} labelOf={labelOf} />
            </ChartsGate>
        </div>
    );
};

export default CallingStatistics;
