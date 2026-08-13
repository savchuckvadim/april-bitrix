'use client';

import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { RELATED_ENTITY_TYPE } from '@/modules/entities/RelatedCrm';
import {
    convertLeadToWork,
    runDeepDuplicateCheck,
} from '../model/LeadRequestThunk';
import { useOpenCrmCard } from '../lib/hooks/use-open-crm-card';
import { LEAD_REQUEST_TEXT } from '../consts/lead-request.const';

/**
 * Действия карточки заявки (кнопки sales-хуков, этап F):
 *  - есть основная сделка И мы не в ней → «Открыть текущую работу»: карточка
 *    сделки открывается СЛАЙДЕРОМ поверх портала (второй работы по заявке не
 *    создаём — правило пользователя, а уводить менеджера из встройки в новую
 *    вкладку незачем: закрыл слайдер — снова в заявке);
 *  - мы уже В этой сделке → кнопки нет, вместо неё строка «работа по заявке —
 *    эта сделка»: открывать сделку поверх самой себя незачем;
 *  - сделки нет → «Преобразовать в работу» (lead-to-work from_lead);
 *  - всегда → «Проверить на дубли» (deep, итог в timeline лида).
 */
export const LeadRequestActionsBar: FC = () => {
    const dispatch = useAppDispatch();
    const card = useAppSelector(state => state.leadRequest.card);
    const saving = useAppSelector(state => state.leadRequest.saving);
    const openCrmCard = useOpenCrmCard();
    const currentDealId = useAppSelector(state =>
        Number(state.app.bitrix.deal?.ID ?? 0),
    );

    if (!card) return null;

    const baseDealId = card.baseDealId;
    // Мы уже стоим в той самой сделке — открывать её слайдером поверх самой
    // себя бессмысленно: кнопка вела в никуда и путала.
    const isInsideBaseDeal =
        Boolean(baseDealId) && Number(baseDealId) === currentDealId;

    return (
        <div className="flex flex-wrap gap-2">
            {isInsideBaseDeal ? (
                <p className="text-xs text-muted-foreground">
                    {LEAD_REQUEST_TEXT.openWorkHereHint}
                </p>
            ) : baseDealId ? (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                        void openCrmCard(RELATED_ENTITY_TYPE.DEAL, baseDealId)
                    }
                >
                    {LEAD_REQUEST_TEXT.openWorkButton}
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
