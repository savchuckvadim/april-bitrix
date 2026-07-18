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

interface CompactLayoutProps {
    visibility: ItemVisibility;
    planTypeAttr?: EventTaskEventType;
    records?: ReactNode;
}

/**
 * Режим карточки сущности / звонка (мало высоты, iframe = fitWindow):
 * плотная сетка «Отчёт | План», второстепенное (контакт, компания, записи)
 * свёрнуто в одну раскрывашку под Планом.
 */
export const CompactLayout: FC<CompactLayoutProps> = ({
    visibility,
    planTypeAttr,
    records,
}) => (
    <div className="grid gap-3 lg:grid-cols-2">
        <section className="space-y-3">
            <ZoneTitle>Отчёт</ZoneTitle>
            <ReportSection />
            {visibility.presentation && <PresentationSection />}
            {visibility.noresult && <NoresultSection />}
            {visibility.sale && <SaleSection />}
            {visibility.postFail && <PostFailSection />}
            <CommentSection rows={3} />
        </section>

        <div className="space-y-3">
            <PlanZone
                withPlan={visibility.plan}
                planTypeAttr={planTypeAttr}
                className="space-y-3"
            />
            {/* Наиболее актуальное из «доп» — контакт — открыто сразу. */}
            <ContactSection />
            <ExtrasDisclosure records={records} />
        </div>
    </div>
);
