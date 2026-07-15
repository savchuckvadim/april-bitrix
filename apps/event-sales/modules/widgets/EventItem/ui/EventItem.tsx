'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import { EventTypeBadge } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport';
import { WorkStatusCode } from '@/modules/entities/EventReport/type/event-report-type';
import {
    getEventTypeAttr,
    planCodeToEventType,
} from '@/modules/entities/EventTask/lib/event-type-token';
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan';
import { DEPARTAMENT_STATE_PROP } from '@/modules/features/Departament/type/department-type';
import { getIsLeadContext } from '@/modules/app/lib/utills/app-state-util';
import { GarantLeadFrame } from '@/modules/entities/EVLid';
import { getItemVisibility } from '../lib/item-visibility';
import { CheckPresentation } from '@/modules/features/AfterPresentation';

// Записи звонков — тяжёлая секция (плеер), доезжает лениво (правило lazy).
const RecordsList = dynamic(
    () => import('@/modules/entities/EventCallingRecord/ui/RecordsList'),
    { ssr: false },
);
import { ReportSection } from './sections/ReportSection';
import { NoresultSection } from './sections/NoresultSection';
import { CommentSection } from './sections/CommentSection';
import { PlanSection } from './sections/PlanSection';
import { SaleSection } from './sections/SaleSection';
import { PresentationSection } from './sections/PresentationSection';
import { PostFailSection } from './sections/PostFailSection';
import { ContactSection } from './sections/ContactSection';
import { CompanySection } from './sections/CompanySection';
import { SendBar } from './SendBar';

/**
 * Форма отчёта по событию (редизайн legacy SalesMenu):
 * - видимость секций — ОДНА чистая функция getItemVisibility;
 * - responsive grid вместо дублированных small/large-веток;
 * - контейнер несёт data-event-type — всё на var(--event-current)
 *   перекрашивается при смене типа текущего/планируемого события.
 */
export const EventItem: FC = () => {
    const menuType = useAppSelector(s => s.eventItemMenu.type);
    const currentTask = useAppSelector(s => s.eventTask.current);
    const workStatus = useAppSelector(
        s => s.eventReport.report[EV_REPORT_PROP.WORK_STATUS].current,
    );
    const planType = useAppSelector(s => s.eventPlan[EV_PLAN_PROP.TYPE].current);
    const config = useAppSelector(s => s.app.config);
    const departmentMode = useAppSelector(
        s => s.department[DEPARTAMENT_STATE_PROP.MODE].current,
    );
    const isLeadContext = useAppSelector(getIsLeadContext);

    const visibility = getItemVisibility({
        menuType,
        workStatusCode: workStatus.code as WorkStatusCode,
        config,
        departmentMode: departmentMode?.code ?? 'sales',
        isLeadContext,
    });

    // Текущий тип: отчитываемся по задаче — её тип; планируем — тип плана.
    const eventTypeAttr = currentTask
        ? getEventTypeAttr(currentTask.eventType)
        : planCodeToEventType(planType?.code);

    return (
        <div data-event-type={eventTypeAttr} className="space-y-4 p-2">
            <header className="flex items-center gap-2 border-l-4 border-[var(--event-current)] pl-3">
                <h1 className="text-lg font-semibold text-foreground">
                    {currentTask?.name || 'Новое событие'}
                </h1>
                {currentTask && <EventTypeBadge type={currentTask.type} />}
            </header>

            {isLeadContext ? (
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-4">
                        <ReportSection />
                        <CommentSection />
                    </div>
                    <GarantLeadFrame />
                </div>
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-4">
                        <ReportSection />
                        <CommentSection />
                    </div>
                    <div className="space-y-4">
                        {visibility.presentation && <PresentationSection />}
                        {visibility.noresult && <NoresultSection />}
                        {visibility.plan && <PlanSection />}
                        {visibility.sale && <SaleSection />}
                        {visibility.postFail && <PostFailSection />}
                        <ContactSection />
                        <CompanySection />
                        {config.withRecords && <RecordsList />}
                    </div>
                </div>
            )}

            <SendBar />
            <CheckPresentation />
        </div>
    );
};

export default EventItem;
