'use client';

import { useState } from 'react';
import { buildProspectScaleView } from '@workspace/april-ui/entity';
import { useAppDispatch, useAppSelector, useSmallDisplay } from '@/modules/app';
import {
    selectClientCard,
    updateClientChoice,
    type ClientChoiceField,
} from '@/modules/entities/client-card';
import { buildClientIdentity } from '../lib/client-identity.util';

/**
 * Клиент в шапке — те же блоки, что у шапки «Звонков»: компания и сделка
 * ссылками на CRM, прогноз (шкала), статус и тип клиента (чипы), ИНН. Прогноз,
 * статус и тип правятся прямо здесь и пишутся в компанию Битрикса; по типу
 * клиента выбираются реквизиты.
 */
export const useClientHeader = () => {
    const dispatch = useAppDispatch();
    const card = useAppSelector(selectClientCard);
    const small = useSmallDisplay();
    const [previewCode, setPreview] = useState<string | null>(null);
    const [pending, setPending] = useState<ClientChoiceField | null>(null);

    const update = async (field: ClientChoiceField, code: string) => {
        setPending(field);
        await dispatch(updateClientChoice(field, code));
        setPending(null);
    };

    return {
        ...buildClientIdentity(card, small),
        prospect: card.prospect
            ? {
                  ...buildProspectScaleView({
                      items: card.prospect.items,
                      current: card.prospect.current,
                      previewCode,
                      isLoading: pending === 'prospect',
                  }),
                  select: (code: string) => void update('prospect', code),
                  setPreview,
              }
            : null,
        status: card.status
            ? {
                  value: card.status.current ?? undefined,
                  options: card.status.items,
                  isLoading: pending === 'status',
                  select: (code: string) => void update('status', code),
              }
            : null,
        clientType: card.clientType
            ? {
                  value: card.clientType.current ?? undefined,
                  options: card.clientType.items,
                  isLoading: pending === 'clientType',
                  select: (code: string) => void update('clientType', code),
              }
            : null,
        inn: card.inn,
    };
};
