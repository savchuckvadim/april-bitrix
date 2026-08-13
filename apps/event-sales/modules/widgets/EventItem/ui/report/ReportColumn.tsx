'use client';

import { FC, ReactNode } from 'react';
import type { ItemVisibility } from '../../lib/item-visibility';
import { getReportDensity } from '../../lib/report-density';
import { SaleSection } from '../sections/SaleSection';
import { PostFailSection } from '../sections/PostFailSection';
import { CommentSection } from '../sections/CommentSection';
import { ContactCreateDialog } from '@/modules/entities/EventContact';
import { ContactCard, ContactDetailsDialog } from './contact';
import { ReportPult } from './ReportPult';

interface ReportColumnProps {
    visibility: ItemVisibility;
    /** Записи звонков — идут НАД комментарием. */
    records?: ReactNode;
    /** Карточка заявки/лида — под комментарием, во всю ширину колонки. */
    request?: ReactNode;
}

/**
 * Левая колонка — всё, ПО ЧЕМУ отчитываемся.
 *
 * Сверху пульт: одна строка микро-контролов, где отмечается ВЕСЬ итог
 * разговора (статус, презентация, причины недозвона и отказа, заявка).
 * Раньше эти отметки жили тремя карточками разного кегля и всплывали в
 * разных местах экрана — рядом с плотной колонкой плана это читалось
 * россыпью, а в самом частом случае («в работе») целая карточка занимала
 * высоту ради одной кнопки.
 *
 * Ниже — комментарий: главный рабочий инструмент, ему достаётся вся
 * освободившаяся вертикаль. Секции продажи и пост-отказа пока отдельными
 * карточками: у них своя сложная логика, они втянутся в пульт следующим
 * шагом (см. docs/event-sales-report-pult.tasks.md).
 */
export const ReportColumn: FC<ReportColumnProps> = ({
    visibility,
    records,
    request,
}) => (
    <div className="space-y-2">
        <ReportPult withNoresult={visibility.noresult} />

        {records}

        <CommentSection
            density={getReportDensity({
                withRecords: Boolean(records),
                withSale: visibility.sale,
                withPostFail: visibility.postFail,
                withContact: true,
                withRequest: Boolean(request),
                withPult: true,
            })}
        />

        {visibility.sale && <SaleSection />}
        {visibility.postFail && <PostFailSection />}

        <ContactCard />

        {request}

        {/* Окно контакта — одно на экран и живёт отдельно от карточки:
            его открывают и когда контакта ещё нет (иконка в пульте). */}
        <ContactDetailsDialog />
        <ContactCreateDialog />
    </div>
);
