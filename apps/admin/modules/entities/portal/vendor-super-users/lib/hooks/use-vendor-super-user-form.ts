'use client';

import { useState } from 'react';
import { useSaveVendorSuperUser } from './use-vendor-super-users';

/** Что не так с введённым Bitrix-id, или null — всё в порядке. */
const bitrixIdError = (raw: string): string | null => {
    const trimmed = raw.trim();
    if (!trimmed) return 'Укажите Bitrix-id сотрудника';
    if (!/^\d+$/.test(trimmed)) return 'Bitrix-id — целое число';
    const id = Number(trimmed);
    if (!Number.isSafeInteger(id) || id <= 0) return 'Bitrix-id больше нуля';
    return null;
};

/**
 * Форма заведения доступа: состояние полей, проверка Bitrix-id и отправка.
 *
 * Проверка живёт здесь, а не в вёрстке: она же понадобится, когда форму
 * переиспользуют в другом месте, и её видно в одном месте вместе с текстами
 * ошибок. Бэк проверяет то же самое повторно — фронтовая проверка только
 * ради понятного сообщения без похода на сервер.
 */
export const useVendorSuperUserForm = (portalId?: number) => {
    const [bitrixId, setBitrixId] = useState('');
    const [comment, setComment] = useState('');
    const [touched, setTouched] = useState(false);
    const save = useSaveVendorSuperUser();

    const error = bitrixIdError(bitrixId);
    /** Показываем ошибку только после попытки отправить или ухода из поля. */
    const visibleError = touched ? error : null;
    const canSubmit = !error && !!portalId && !save.isPending;

    const submit = () => {
        setTouched(true);
        if (!canSubmit || !portalId) return;
        save.mutate(
            {
                portalId,
                payload: {
                    bitrixId: Number(bitrixId.trim()),
                    comment: comment.trim() || null,
                },
            },
            {
                onSuccess: () => {
                    setBitrixId('');
                    setComment('');
                    setTouched(false);
                },
            },
        );
    };

    return {
        bitrixId,
        setBitrixId,
        comment,
        setComment,
        error: visibleError,
        canSubmit,
        isPending: save.isPending,
        onBlur: () => setTouched(true),
        submit,
    };
};
