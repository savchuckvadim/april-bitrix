'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { searchDuplicates } from '../../model/DuplicatesThunk';
import { DUPLICATE_ENTITY_TYPE, DUPLICATE_SEARCH_LEVEL } from '../../model';

/**
 * Форма ручного поиска: ИНН, название компании, ID компании.
 *
 * ИНН и название уходят сигналами; ID компании — сущностью, от которой
 * бэкенд сам соберёт телефоны, почты и ИНН из полей портала.
 */
export function useManualSearch() {
    const dispatch = useAppDispatch();
    const [inn, setInn] = useState('');
    const [title, setTitle] = useState('');
    const [companyId, setCompanyId] = useState('');

    const isEmpty = !inn.trim() && !title.trim() && !companyId.trim();

    const submit = () => {
        if (isEmpty) return;
        const id = Number(companyId.trim());

        dispatch(
            searchDuplicates({
                force: true,
                // Название ищется подстрокой — это второй уровень.
                level: title.trim()
                    ? DUPLICATE_SEARCH_LEVEL.NUMBER_2
                    : DUPLICATE_SEARCH_LEVEL.NUMBER_1,
                raw: {
                    inns: inn.trim() ? [inn.trim()] : undefined,
                    titles: title.trim() ? [title.trim()] : undefined,
                },
                ...(Number.isFinite(id) && id > 0
                    ? {
                          entityType: DUPLICATE_ENTITY_TYPE.COMPANY,
                          entityId: id,
                      }
                    : {}),
            }),
        );
    };

    return {
        inn,
        title,
        companyId,
        isEmpty,
        setInn,
        setTitle,
        setCompanyId,
        submit,
    };
}
