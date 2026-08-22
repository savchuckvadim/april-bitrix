'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { ContactField, EV_CONTACT_TYPE } from '@/modules/entities/EventContact';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useRequestLeadIds } from '@/modules/features/LeadRequestCard/lib/hooks/use-request-lead-ids';
import { ContactMini } from './ContactMini';
import { RequestMini } from './RequestMini';

/**
 * Правая половина верхнего ряда отчёта: с кем говорим и по какой заявке.
 *
 * Раньше контакт был карточкой ПОД комментарием, а заявка пряталась за
 * иконкой — на экране не было ответа на вопрос «что вообще прикреплено к
 * делу». Теперь оба стоят рядом с пультом, и место делится по факту: есть
 * оба — пополам, один — на всю ширину, нет ничего — приглашение выбрать
 * контакт тем же комбобоксом, что и везде.
 */
export const ReportSideMinis: FC = () => {
    const hasContact = useAppSelector(s => Boolean(s.contact.current.report));
    const hasRequest = useRequestLeadIds().length > 0;

    if (!hasContact && !hasRequest) {
        return (
            <div className="flex h-full items-center rounded-lg border border-dashed border-border p-2">
                <ContactField
                    type={EV_CONTACT_TYPE.REPORT}
                    label="С кем говорили"
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                'grid h-full min-w-0 gap-2',
                hasContact && hasRequest && '@md:grid-cols-2',
            )}
        >
            {hasContact && <ContactMini />}
            {hasRequest && <RequestMini />}
        </div>
    );
};
