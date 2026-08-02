'use client';

import type { FC } from 'react';
import { Send } from 'lucide-react';
import { GlassCard } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { useSimCallForm } from '../../hooks/use-sim-call-form';
import type { SimReport } from '../../lib/simulator.util';
import { SimEventBadge } from './SimEventBadge';
import { SimPlanZone } from './SimPlanZone';
import { SimReportZone } from './SimReportZone';

interface SimCallFormProps {
    /** Событие, по которому отчитываемся. */
    reportedEventCode: string | null;
    /** Заголовок задачи — он же название события. */
    taskTitle: string;
    /** Подпись стадии, куда потянет планируемое событие. */
    plannedStageLabel: (eventCode: string) => string;
    onSubmit: (report: SimReport) => void;
}

/**
 * Форма «Звонки» — та самая единственная форма менеджера.
 *
 * Раскладка повторяет оригинал (`apps/event-sales`, виджет EventItem): слева
 * отчёт о прошедшем, справа отдельной колонкой план следующего. Две зоны живут
 * в РАЗНЫХ цветах — каждая несёт свой data-event-type, — потому что отчитаться
 * можно об одном событии, а назначить другое.
 *
 * Всё, чего менеджер здесь не делает руками, система берёт на себя: это видно
 * в ленте сразу после отправки.
 */
export const SimCallForm: FC<SimCallFormProps> = ({
    reportedEventCode,
    taskTitle,
    plannedStageLabel,
    onSubmit,
}) => {
    const form = useSimCallForm(reportedEventCode);

    return (
        <GlassCard
            intensity="soft"
            data-event-type={form.reported?.dataEventType ?? 'warm'}
            className="rounded-2xl border p-4"
        >
            <header
                className="border-l-4 pl-3"
                style={{ borderLeftColor: 'var(--event-current)' }}
            >
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-foreground text-lg font-bold">
                        {taskTitle}
                    </h3>
                    {form.reported && (
                        <SimEventBadge label={form.reported.label} />
                    )}
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">
                    Отчитываемся по этому событию. Название задачи хранится
                    отдельно от типа — тип задаёт цвет всей формы.
                </p>
            </header>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_18rem]">
                <SimReportZone
                    result={form.result}
                    onResultChange={form.setResult}
                    noresultReason={form.noresultReason}
                    onNoresultReasonChange={form.setNoresultReason}
                    workStatus={form.workStatus}
                    onWorkStatusChange={form.setWorkStatus}
                    isFail={form.isFail}
                    isSetAside={form.isSetAside}
                    workStatusItems={form.workStatusItems}
                    failType={form.failType}
                    onFailTypeChange={form.setFailType}
                    failReason={form.failReason}
                    onFailReasonChange={form.setFailReason}
                    isResult={form.isResult}
                    isPresentationReport={form.isPresentationReport}
                    presentationHeld={form.presentationHeld}
                    onPresentationHeldChange={form.setPresentationHeld}
                    unplannedPresentation={form.unplannedPresentation}
                    onUnplannedPresentationChange={
                        form.setUnplannedPresentation
                    }
                    comment={form.comment}
                    onCommentChange={form.setComment}
                    contactId={form.reportContact}
                    onContactChange={form.setReportContact}
                    errors={form.errors}
                    showErrors={form.showErrors}
                />

                {form.isFinishing ? (
                    <aside className="bg-muted/40 h-fit rounded-xl border p-4">
                        <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                            План
                        </p>
                        <p className="text-foreground/90 mt-2 text-xs leading-relaxed">
                            {form.workStatus === 'success'
                                ? 'Продажа закрывает сделку — планировать больше нечего. Дальше с клиентом общаются постпродажным типом «Поставка», он намеренно не двигает лестницу.'
                                : 'Отказ закрывает сделку. Компания уходит в буфер отказников и вернётся в холодный обзвон — уже к другому менеджеру.'}
                        </p>
                    </aside>
                ) : (
                    <SimPlanZone
                        planned={form.planned}
                        plannedStageLabel={plannedStageLabel(
                            form.nextEventCode,
                        )}
                        isPlanning={form.isPlanning}
                        onPlanningChange={form.setIsPlanning}
                        isResult={form.isResult}
                        nextEventCode={form.nextEventCode}
                        onEventChange={form.setNextEventCode}
                        title={form.planTitle}
                        onTitleChange={form.setPlanTitle}
                        deadline={form.planDeadline}
                        onDeadlineChange={form.setPlanDeadline}
                        contactId={form.planContact}
                        onContactChange={form.setPlanContact}
                        errors={form.errors}
                        showErrors={form.showErrors}
                    />
                )}
            </div>

            <Button
                className="mt-4 w-full gap-1.5"
                onClick={() => form.submit(onSubmit)}
            >
                <Send className="size-4" />
                Отправить отчёт
            </Button>

            {form.showErrors && Object.keys(form.errors).length > 0 && (
                <p className="text-destructive mt-2 text-center text-xs">
                    Форма не отправлена: заполните отмеченные поля.
                </p>
            )}
        </GlassCard>
    );
};
