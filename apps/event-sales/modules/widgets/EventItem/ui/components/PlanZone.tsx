'use client';

import { FC } from 'react';
import { EventTaskEventType } from '@/modules/entities/EventTask/types/event-task-type';
import { ZoneTitle } from './ZoneTitle';
import { PlanSection } from '../sections/PlanSection';

interface PlanZoneProps {
    /** visibility.plan — false при финальных статусах (Продажа/Отказ). */
    withPlan: boolean;
    /** Тип планируемого события — перекрашивает зону в его цвет. */
    planTypeAttr?: EventTaskEventType;
    className?: string;
}

/** Зона «План» — визуально отделена от отчёта и живёт в цвете плана. */
export const PlanZone: FC<PlanZoneProps> = ({
    withPlan,
    planTypeAttr,
    className,
}) => (
    <aside data-event-type={planTypeAttr} className={className}>
        <ZoneTitle>План</ZoneTitle>
        {withPlan ? (
            <PlanSection />
        ) : (
            <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                По финальному статусу следующее событие не планируется
            </p>
        )}
    </aside>
);
