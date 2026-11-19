'use client';

import { useEffect, useState } from 'react';
import { CALL_REVIEW_TEXT } from '@/modules/entities/call-review/lib/call-review.texts';

/**
 * «← К списку разборов» над шапкой, если пришли из списка (`?from=calls`):
 * шаг назад в истории окна — список откроется с теми же фильтрами и
 * страницей (они в адресе списка). Разбор открыт в новом окне (истории
 * нет) — ссылки нет: вернуться некуда.
 */
export const CallPageBackLink = () => {
    const [canGoBack, setCanGoBack] = useState(false);

    useEffect(() => {
        setCanGoBack(window.history.length > 1);
    }, []);

    if (!canGoBack) return null;
    return (
        <button
            type="button"
            className="cursor-pointer text-sm text-primary hover:underline"
            onClick={() => window.history.back()}
        >
            {CALL_REVIEW_TEXT.backToList}
        </button>
    );
};
