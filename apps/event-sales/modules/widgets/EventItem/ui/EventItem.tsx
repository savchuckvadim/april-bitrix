'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport';
import {
    getEventTypeAttr,
    planCodeToEventType,
} from '@/modules/entities/EventTask/lib/event-type-token';
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan';
import { DEPARTAMENT_STATE_PROP } from '@/modules/features/Departament/type/department-type';
import { getIsLeadContext } from '@/modules/app/lib/utills/app-state-util';
import { ActionPromptCard } from '@/modules/features/ActionPrompts';
import { CheckPresentation } from '@/modules/features/AfterPresentation';
import { getItemVisibility } from '../lib/item-visibility';
import { ItemHeader } from './header/ItemHeader';
import { ReportColumn } from './report/ReportColumn';
import { PlanColumn } from './plan/PlanColumn';
import { ItemActions } from './plan/ItemActions';
import { HistoryTab } from './history/HistoryTab';

// Записи звонков — тяжёлая секция (плееры), доезжает лениво (правило lazy).
const RecordsList = dynamic(
    () => import('@/modules/entities/EventCallingRecord/ui/RecordsList'),
    { ssr: false },
);

// Лента дублей тянет за собой модалку деталей — грузим лениво, форму отчёта
// она задерживать не должна.
const DuplicatesPanel = dynamic(
    () =>
        import(
            '@/modules/features/Duplicates/ui/DuplicatesPanel/DuplicatesPanel'
        ).then(module => module.DuplicatesPanel),
    { ssr: false },
);

// Карточка заявки/лида: видна только при лиде в контексте, форму отчёта
// не задерживает — лениво, как и дубли.
// Экран подтверждения заявки: перекрывает всё, поэтому монтируется рядом с
// остальными модалками карточки.
const LeadConfirmGate = dynamic(
    () =>
        import('@/modules/features/LeadRequestCard/ui/LeadConfirmGate').then(
            module => module.LeadConfirmGate,
        ),
    { ssr: false },
);
const LeadRequestPanel = dynamic(
    () => import('@/modules/features/LeadRequestCard/ui/LeadRequestPanel'),
    { ssr: false },
);

// Модалка «презентация связана с заявкой?» — обязательный шаг отправки
// при факте презентации; открывается редко, поэтому лениво.
const PresentationLeadLinkDialog = dynamic(
    () =>
        import(
            '@/modules/features/PresentationLeadLink/ui/PresentationLeadLinkDialog'
        ),
    { ssr: false },
);

/**
 * Форма отчёта по событию.
 *
 * Один макет на все размеры: sticky-шапка с контекстом, предупреждениями и
 * действиями, под ней две колонки — слева отчёт с большим комментарием,
 * справа узкая колонка плана. Раньше здесь было четыре варианта раскладки
 * с переключателем; нужен один хорошо собранный.
 *
 * Цвет: контейнер несёт data-event-type отчётного события, колонка плана —
 * СВОЙ, планируемого. Отчитываемся об одном, назначаем другое — и это видно.
 */
export const EventItem: FC = () => {
    const menuType = useAppSelector(s => s.eventItemMenu.type);
    const workStatus = useAppSelector(
        s => s.eventReport.report[EV_REPORT_PROP.WORK_STATUS].current,
    );
    const currentTask = useAppSelector(s => s.eventTask.current);
    const planType = useAppSelector(
        s => s.eventPlan[EV_PLAN_PROP.TYPE].current,
    );
    const config = useAppSelector(s => s.app.config);
    const departmentMode = useAppSelector(
        s => s.department[DEPARTAMENT_STATE_PROP.MODE].current,
    );
    const isLeadContext = useAppSelector(getIsLeadContext);

    const visibility = getItemVisibility({
        menuType,
        workStatusCode: workStatus.code,
        config,
        departmentMode: departmentMode?.code ?? 'sales',
        isLeadContext,
    });

    // Текущий тип: отчитываемся по задаче — её тип; планируем — тип плана.
    const eventTypeAttr = currentTask
        ? getEventTypeAttr(currentTask.eventType)
        : planCodeToEventType(planType?.code);
    const planTypeAttr = planCodeToEventType(planType?.code);

    return (
        <div
            data-event-type={eventTypeAttr}
            className="flex h-svh flex-col bg-background"
        >
            <ItemHeader withPresentation={visibility.presentation} />

            <Tabs
                defaultValue="report"
                className="flex min-h-0 flex-1 flex-col"
            >
                <TabsList className="mx-3 mt-2 self-start">
                    <TabsTrigger value="report">Отчёт</TabsTrigger>
                    <TabsTrigger value="history">История</TabsTrigger>
                </TabsList>

                <TabsContent
                    value="report"
                    className="min-h-0 flex-1 overflow-y-auto p-3"
                >
                    {/*
                     * 26rem, а не 22: в план входят дата и время, и на узкой
                     * колонке они не вставали в две колонки даже при обычном
                     * --app-scale (контейнерный запрос @[17rem] в PlanColumn).
                     */}
                    <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_26rem]">
                        <ReportColumn
                            /* Заявка — про отчёт, а не про план: она про то,
                               что уже произошло с обращением клиента. */
                            request={<LeadRequestPanel />}
                            visibility={visibility}
                            records={
                                config.withRecords ? <RecordsList /> : undefined
                            }
                        />
                        <div className="space-y-3 lg:sticky lg:top-0">
                            <PlanColumn
                                withPlan={visibility.plan}
                                planTypeAttr={planTypeAttr}
                            />
                            <div className="hidden lg:block">
                                <ItemActions variant="column" />
                            </div>
                            {/* Ниже действий: сигналы не должны отодвигать
                                кнопку отправки. */}
                            <DuplicatesPanel />
                        </div>
                    </div>

                    {/* Колонки схлопнулись — кнопки уехали бы в конец страницы,
                        поэтому ниже lg они живут нижней панелью. */}
                    <div className="lg:hidden -mx-3 -mb-3 mt-3">
                        <ItemActions variant="bar" />
                    </div>
                </TabsContent>

                <TabsContent
                    value="history"
                    className="min-h-0 flex-1 overflow-y-auto p-3"
                >
                    <HistoryTab />
                </TabsContent>
            </Tabs>

            <LeadConfirmGate />
            <ActionPromptCard />
            <CheckPresentation />
            <PresentationLeadLinkDialog />
        </div>
    );
};

export default EventItem;
