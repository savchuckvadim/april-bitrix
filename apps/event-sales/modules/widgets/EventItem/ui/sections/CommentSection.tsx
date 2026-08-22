'use client';

import { FC } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Textarea } from '@workspace/ui/components/textarea';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    EV_REPORT_PROP,
    setAndSaveComment,
} from '@/modules/entities/EventReport';
import { cn } from '@workspace/ui/lib/utils';
import { COMMENT_ROWS, type ReportDensity } from '../../lib/report-density';
import { PresentationDoneControl } from '../report/PresentationDoneControl';

/**
 * Комментарий отчёта — главный рабочий инструмент менеджера.
 *
 * Большое поле сразу, без раскрытия: не «строчка, которую надо тянуть»,
 * а полноценное окно. Растёт по содержимому, дальше тянется вручную.
 * Черновик пишется в localStorage, при отправке обязателен.
 *
 * Стартовая высота зависит от того, сколько карточек стоит рядом: одна —
 * комментарию достаётся вся вертикаль, пять — он ужимается, но не ниже
 * читаемого минимума (см. report-density).
 *
 * В углу шапки — отметка презентации: раньше она жила в шапке экрана, далеко
 * от места, где менеджер описывает разговор. Отмечают её ровно тогда, когда
 * пишут комментарий, — теперь она рядом, вместе с объяснением состояния.
 */
interface CommentSectionProps {
    density?: ReportDensity;
    /**
     * Занять всю высоту колонки — на широком экране карточка дотягивается до
     * кнопок отправки справа, вместо того чтобы висеть с пустотой под собой.
     */
    fill?: boolean;
    /** Показывать отметку презентации в углу карточки (visibility.presentation). */
    withPresentation?: boolean;
}

export const CommentSection: FC<CommentSectionProps> = ({
    density = 'normal',
    withPresentation = false,
    fill = false,
}) => {
    const dispatch = useAppDispatch();
    const comment = useAppSelector(
        s => s.eventReport.report[EV_REPORT_PROP.COMMENT],
    );
    const error = useAppSelector(s => s.event.errors.current.comment);

    return (
        <SectionCard
            title="Комментарий"
            state={error ? 'error' : 'default'}
            message={error}
            density="comfortable"
            collapsible
            defaultOpen
            actions={withPresentation ? <PresentationDoneControl /> : undefined}
            className={cn(fill && 'flex min-h-0 flex-1 flex-col')}
            contentClassName={cn(fill && 'flex min-h-0 flex-1 flex-col')}
        >
            <Textarea
                value={comment}
                placeholder="Как прошёл разговор?"
                aria-invalid={!!error}
                onChange={e => dispatch(setAndSaveComment(e.target.value))}
                rows={COMMENT_ROWS[density]}
                className={cn(
                    'resize-y',
                    // В fill-режиме высоту задаёт карточка, а рост по
                    // содержимому с этим дрался бы.
                    fill ? 'min-h-40 flex-1' : 'field-sizing-content',
                )}
            />
        </SectionCard>
    );
};
