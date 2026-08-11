'use client';

import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    RELATED_ENTITY_TYPE,
    getEntityCardUrl,
} from '@/modules/entities/RelatedCrm';
import {
    convertLeadToWork,
    runDeepDuplicateCheck,
} from '../model/LeadRequestThunk';
import { LEAD_REQUEST_TEXT } from '../consts/lead-request.const';

/**
 * Действия карточки заявки (кнопки sales-хуков, этап F):
 *  - есть основная сделка → «Открыть текущую работу» (карточка CRM в
 *    соседней вкладке — второй работы не создаём, правило пользователя);
 *  - сделки нет → «Преобразовать в работу» (lead-to-work from_lead);
 *  - всегда → «Проверить на дубли» (deep, итог в timeline лида).
 */
export const LeadRequestActionsBar: FC = () => {
    const dispatch = useAppDispatch();
    const card = useAppSelector(state => state.leadRequest.card);
    const saving = useAppSelector(state => state.leadRequest.saving);
    const domain = useAppSelector(state => state.app.domain);

    if (!card) return null;

    const workUrl = card.baseDealId
        ? getEntityCardUrl(domain, RELATED_ENTITY_TYPE.DEAL, card.baseDealId)
        : null;

    return (
        <div className="flex flex-wrap gap-2">
            {workUrl ? (
                <Button size="sm" variant="outline" asChild>
                    <a href={workUrl} target="_blank" rel="noreferrer">
                        {LEAD_REQUEST_TEXT.openWorkButton}
                    </a>
                </Button>
            ) : (
                <Button
                    size="sm"
                    variant="outline"
                    disabled={saving}
                    title={LEAD_REQUEST_TEXT.convertHint}
                    onClick={() => dispatch(convertLeadToWork())}
                >
                    {LEAD_REQUEST_TEXT.convertButton}
                </Button>
            )}
            <Button
                size="sm"
                variant="outline"
                disabled={saving}
                title={LEAD_REQUEST_TEXT.deepCheckQueued}
                onClick={() => dispatch(runDeepDuplicateCheck())}
            >
                {LEAD_REQUEST_TEXT.deepCheckButton}
            </Button>
        </div>
    );
};
