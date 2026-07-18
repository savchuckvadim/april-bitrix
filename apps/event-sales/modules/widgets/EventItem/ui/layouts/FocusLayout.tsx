'use client';

import { FC, ReactNode } from 'react';
import { EventTaskEventType } from '@/modules/entities/EventTask/types/event-task-type';
import { ItemVisibility } from '../../lib/item-visibility';
import { ZoneTitle } from '../components/ZoneTitle';
import { PlanZone } from '../components/PlanZone';
import { ExtrasDisclosure } from '../components/ExtrasDisclosure';
import { ReportSection } from '../sections/ReportSection';
import { CommentSection } from '../sections/CommentSection';
import { PresentationSection } from '../sections/PresentationSection';
import { NoresultSection } from '../sections/NoresultSection';
import { SaleSection } from '../sections/SaleSection';
import { PostFailSection } from '../sections/PostFailSection';
import { ContactSection } from '../sections/ContactSection';

interface FocusLayoutProps {
    visibility: ItemVisibility;
    planTypeAttr?: EventTaskEventType;
    records?: ReactNode;
}

/**
 * Full-режим, вариант «фокус на комментарии»: главное в timeline —
 * написать, что произошло. Большой комментарий занимает центр,
 * всё остальное (отчёт-селекты, План, контакт, компания) — компактный
 * рейл справа; записи звонков — под комментарием.
 */
export const FocusLayout: FC<FocusLayoutProps> = ({
    visibility,
    planTypeAttr,
    records,
}) => (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
        <section className="space-y-4">
            <ZoneTitle>Отчёт</ZoneTitle>
            <CommentSection rows={14} />
            {records}
        </section>

        <aside className="space-y-3 self-start">
            <ReportSection />
            {visibility.presentation && <PresentationSection />}
            {visibility.noresult && <NoresultSection />}
            {visibility.sale && <SaleSection />}
            {visibility.postFail && <PostFailSection />}
            <PlanZone
                withPlan={visibility.plan}
                planTypeAttr={planTypeAttr}
                className="space-y-3"
            />
            <ContactSection />
            <ExtrasDisclosure />
        </aside>
    </div>
);
