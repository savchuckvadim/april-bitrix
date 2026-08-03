'use client';

import { FC } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Textarea } from '@workspace/ui/components/textarea';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_REPORT_PROP, setAndSaveComment } from '@/modules/entities/EventReport';

/**
 * Комментарий отчёта — главный рабочий инструмент менеджера.
 *
 * Большое поле сразу, без раскрытия: не «строчка, которую надо тянуть»,
 * а полноценное окно. Растёт по содержимому, дальше тянется вручную.
 * Черновик пишется в localStorage, при отправке обязателен.
 */
export const CommentSection: FC = () => {
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
        >
            <Textarea
                value={comment}
                placeholder="Как прошёл разговор?"
                aria-invalid={!!error}
                onChange={e => dispatch(setAndSaveComment(e.target.value))}
                className="field-sizing-content min-h-40 resize-y"
            />
        </SectionCard>
    );
};
