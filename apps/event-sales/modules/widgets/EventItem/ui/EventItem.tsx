'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import { EventTypeBadge } from '@workspace/april-ui';
import { ThemeTogglePanel } from '@workspace/theme';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useLayoutMode } from '@/modules/app/lib/hooks/use-layout-mode';
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
import { CommentSection } from './sections/CommentSection';
import { FullLayout } from './layouts/FullLayout';
import { GridLayout } from './layouts/GridLayout';
import { FocusLayout } from './layouts/FocusLayout';
import { CompactLayout } from './layouts/CompactLayout';
import { LayoutVariantSwitcher } from './components/LayoutVariantSwitcher';
import { useItemLayoutVariant } from '../lib/hooks/use-item-layout-variant';
import { SendBar } from './SendBar';

/**
 * Форма отчёта по событию:
 * - видимость секций — ОДНА чистая функция getItemVisibility;
 * - режим вёрстки из placement (useLayoutMode):
 *   compact (карточка сущности/звонка) — плотная сетка + раскрывашка,
 *   full (timeline) — отчёт слева с большим комментарием, План-саммари справа;
 * - контейнер несёт data-event-type — всё на var(--event-current)
 *   перекрашивается при смене типа; зона Плана несёт СВОЙ data-event-type
 *   планируемого типа и живёт в его цвете.
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
    const layoutMode = useLayoutMode();
    const [layoutVariant, setLayoutVariant] = useItemLayoutVariant();

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
    const planTypeAttr = planCodeToEventType(planType?.code);

    const records = config.withRecords ? <RecordsList /> : undefined;
    const isCompact = layoutMode === 'compact';

    return (
        <div
            data-event-type={eventTypeAttr}
            data-layout={layoutMode}
            className={isCompact ? 'space-y-3 p-1' : 'space-y-4 p-2'}
        >
            <header className="flex items-center gap-2 border-l-4 border-[var(--event-current)] pl-3">
                <h1
                    className={`font-semibold text-foreground ${isCompact ? 'text-base' : 'text-lg'}`}
                >
                    {currentTask?.name || 'Новое событие'}
                </h1>
                {currentTask && <EventTypeBadge type={currentTask.type} />}
                <div className="ml-auto flex items-center gap-2">
                    {!isCompact && !isLeadContext && (
                        <LayoutVariantSwitcher
                            value={layoutVariant}
                            onChange={setLayoutVariant}
                        />
                    )}
                    <ThemeTogglePanel />
                </div>
            </header>

            {isLeadContext ? (
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-4">
                        <ReportSection />
                        <CommentSection />
                    </div>
                    <GarantLeadFrame />
                </div>
            ) : isCompact ? (
                <CompactLayout
                    visibility={visibility}
                    planTypeAttr={planTypeAttr}
                    records={records}
                />
            ) : layoutVariant === 'grid' ? (
                <GridLayout
                    visibility={visibility}
                    planTypeAttr={planTypeAttr}
                    records={records}
                />
            ) : layoutVariant === 'focus' ? (
                <FocusLayout
                    visibility={visibility}
                    planTypeAttr={planTypeAttr}
                    records={records}
                />
            ) : (
                <FullLayout
                    visibility={visibility}
                    planTypeAttr={planTypeAttr}
                    records={records}
                />
            )}

            <SendBar />
            <CheckPresentation />
        </div>
    );
};

export default EventItem;
