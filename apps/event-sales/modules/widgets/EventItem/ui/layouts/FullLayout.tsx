'use client';

import { FC, ReactNode } from 'react';
import { EventTaskEventType } from '@/modules/entities/EventTask/types/event-task-type';
import { ItemVisibility } from '../../lib/item-visibility';
import { ZoneTitle } from '../components/ZoneTitle';
import { PlanZone } from '../components/PlanZone';
import { ReportSection } from '../sections/ReportSection';
import { CommentSection } from '../sections/CommentSection';
import { PresentationSection } from '../sections/PresentationSection';
import { NoresultSection } from '../sections/NoresultSection';
import { SaleSection } from '../sections/SaleSection';
import { PostFailSection } from '../sections/PostFailSection';
import { ContactSection } from '../sections/ContactSection';
import { CompanySection } from '../sections/CompanySection';

interface FullLayoutProps {
    visibility: ItemVisibility;
    planTypeAttr?: EventTaskEventType;
    records?: ReactNode;
}

/**
 * Timeline-режим (полная высота, есть прокрутка):
 * слева — всё, ПО ЧЕМУ отчитываемся (отчёт, презентация/причина, продажа,
 * БОЛЬШОЙ комментарий, контакт, компания, записи); справа — sticky-саммари
 * «План» в цвете планируемого типа события.
 */
export const FullLayout: FC<FullLayoutProps> = ({
    visibility,
    planTypeAttr,
    records,
}) => (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <section className="space-y-4">
            <ZoneTitle>Отчёт</ZoneTitle>
            <ReportSection />
            {visibility.presentation && <PresentationSection />}
            {visibility.noresult && <NoresultSection />}
            {visibility.sale && <SaleSection />}
            {visibility.postFail && <PostFailSection />}
            <CommentSection rows={8} />
            <ContactSection />
            <CompanySection />
            {records}
        </section>

        <PlanZone
            withPlan={visibility.plan}
            planTypeAttr={planTypeAttr}
            className="space-y-4 self-start lg:sticky lg:top-4"
        />
    </div>
);
