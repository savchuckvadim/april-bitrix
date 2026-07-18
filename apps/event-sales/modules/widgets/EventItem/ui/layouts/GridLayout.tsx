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

interface GridLayoutProps {
    visibility: ItemVisibility;
    planTypeAttr?: EventTaskEventType;
    records?: ReactNode;
}

/**
 * Full-режим, вариант «сетка 50/50»: слева ВСЁ, что относится к Report
 * (отчёт, комментарий, контакт, компания), справа — План и записи.
 */
export const GridLayout: FC<GridLayoutProps> = ({
    visibility,
    planTypeAttr,
    records,
}) => (
    <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-4">
            <ZoneTitle>Отчёт</ZoneTitle>
            <ReportSection />
            {visibility.presentation && <PresentationSection />}
            {visibility.noresult && <NoresultSection />}
            {visibility.sale && <SaleSection />}
            {visibility.postFail && <PostFailSection />}
            <CommentSection rows={6} />
            <ContactSection />
            <CompanySection />
        </section>

        <div className="space-y-4">
            <PlanZone
                withPlan={visibility.plan}
                planTypeAttr={planTypeAttr}
                className="space-y-4"
            />
            {records}
        </div>
    </div>
);
