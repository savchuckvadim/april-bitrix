'use client';

import { FC, ReactNode } from 'react';
import type { ItemVisibility } from '../../lib/item-visibility';
import { getReportDensity } from '../../lib/report-density';
import { CommentSection } from '../sections/CommentSection';
import {
    ContactCreateDialog,
    ContactQuickPickDialog,
} from '@/modules/entities/EventContact';
import { ContactDetailsDialog } from './contact';
import { ChecklistInlineCard } from '@/modules/features/CallChecklist';
import { ReportPult } from './ReportPult';
import { ReportSideMinis } from './ReportSideMinis';
import { RequestDialog } from './RequestDialog';

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
 * Верхний ряд делится пополам: слева пульт (весь итог разговора в одну
 * строку контролов), справа — с кем говорили и по какой заявке. Раньше
 * контакт стоял отдельной карточкой ниже комментария, а заявка вообще
 * пряталась за иконкой: понять, что прикреплено к делу, по экрану было
 * нельзя, зато вертикаль под комментарий съедалась.
 *
 * Ниже — комментарий во всю ширину: главный рабочий инструмент, ему
 * достаётся освободившееся место.
 */
export const ReportColumn: FC<ReportColumnProps> = ({
    visibility,
    records,
    request,
}) => (
    <div className="@container flex min-h-0 flex-col gap-2">
        {/* items-stretch: контакт и заявка стоят вровень с карточкой отчёта —
            разная высота половин читалась как случайность вёрстки. */}
        <div className="grid min-w-0 items-stretch gap-2 @2xl:grid-cols-2">
            <ReportPult
                withNoresult={visibility.noresult}
                withSale={visibility.sale}
                withPostFail={visibility.postFail}
                withPresentationButton={visibility.presentation}
            />
            <ReportSideMinis />
        </div>

        {/* Вопросы по типу ОТЧЁТНОГО события (доработка/решение/оплата):
            итог разговора в поля, а не только в текст комментария. Стоят
            НАД комментарием — их заполняют по горячим следам, пересказывая
            разговор своими словами уже ниже. Набор пуст (настройка выключена,
            тип другой) — не рендерится ничего. */}
        <ChecklistInlineCard place="report" />

        {records}

        {/* fill: на широком экране карточка тянется до низа ряда — то есть
            до кнопок «Отмена/Отправить» справа. Комментарий главный на
            экране, и пустое место под ним доставалось бы никому. */}
        <CommentSection
            fill
            withPresentation={visibility.presentation}
            density={getReportDensity({
                withRecords: Boolean(records),
                withRequest: Boolean(request),
                // Контакт и заявка больше не отдельные карточки — они в
                // верхнем ряду и вертикаль у комментария не отнимают.
                withPult: true,
            })}
        />

        {request}

        {/* Окна живут отдельно от карточек: их открывают и когда карточки
            на экране нет (иконки привязок в пульте). */}
        <ContactDetailsDialog />
        <ContactCreateDialog />
        <ContactQuickPickDialog />
        <RequestDialog />
    </div>
);
