'use client';
import { ReportType } from '@/modules/feature';
import { useAccess } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
import { useReportType } from '@/modules/feature/report-widget-type';
import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import { KpiReportBlock } from './blocks/KpiReportBlock';
import { CallingsReportBlock } from './blocks/CallingsReportBlock';
import { MergedReportBlock } from './blocks/MergedReportBlock';
import { AirtimeBlock } from './blocks/AirtimeBlock';
import { PlansBlock } from './blocks/PlansBlock';
import { AiAnalyticsReport, ConversionsBlock, FinanceReport } from './blocks/lazy';

/**
 * Тело отчёта: переключатель типа + композиция блоков.
 * Данные и разбивки живут внутри блоков (blocks/*Block), здесь —
 * только какой набор блоков показывает каждый тип отчёта.
 */
export const Report = () => {
    const { current: reportType } = useReportType();
    // Гейт на случай кадра до авто-увода недоступной вкладки на «Все»
    const canFinance = useAccess(EAccessFeature.FINANCE_TAB);
    const canAi = useAccess(EAccessFeature.AI_TAB);
    // Вкладки без блоков отчёта: эфирное время к ним не относится.
    const isStandalone =
        reportType === EReportType.FINANCE || reportType === EReportType.AI;

    return (
        <div>
            <div className="mt-6 mb-4 flex h-10 w-full items-center justify-between rounded-md p-0">
                <ReportType />
            </div>

            {reportType === EReportType.All && (
                <>
                    <KpiReportBlock wrapped />
                    <CallingsReportBlock wrapped />
                    <MergedReportBlock wrapped />
                    {/* <ConversionsBlock scope="merged" /> */}
                    <PlansBlock />
                </>
            )}

            {reportType === EReportType.EVENTS && (
                <div>
                    <KpiReportBlock />
                    <ConversionsBlock scope="kpi" />
                    <PlansBlock />
                </div>
            )}

            {reportType === EReportType.CALLINGS && (
                <div>
                    <CallingsReportBlock />
                    <div className='mt-4'></div>
                    <ConversionsBlock scope="callings" />
                    <PlansBlock />
                </div>
            )}

            {reportType === EReportType.MERGED && (
                <div>
                    <MergedReportBlock />
                    <ConversionsBlock scope="merged" />
                    <PlansBlock />
                </div>
            )}

            {reportType === EReportType.FINANCE && canFinance && (
                <FinanceReport />
            )}

            {reportType === EReportType.AI && canAi && <AiAnalyticsReport />}

            {/* Эфирное время — во всех типах отчёта, кроме «Финансов» и «AI». */}
            {!isStandalone && <AirtimeBlock />}
        </div>
    );
};
