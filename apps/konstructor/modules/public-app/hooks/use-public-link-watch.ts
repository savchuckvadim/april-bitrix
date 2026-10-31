'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkPublicLink } from '../model/PublicAccessThunk';
import type { PublicDispatch } from '../model/public-store';

const CHECK_EVERY_MS = 5 * 60 * 1000;

/**
 * Отзыв доходит до открытых вкладок: ссылка перепроверяется при возврате на
 * вкладку и раз в несколько минут, пока вкладка видна.
 */
export const usePublicLinkWatch = () => {
    const dispatch = useDispatch<PublicDispatch>();

    useEffect(() => {
        const check = () => {
            if (document.visibilityState === 'visible') {
                void dispatch(checkPublicLink());
            }
        };
        document.addEventListener('visibilitychange', check);
        const timer = setInterval(check, CHECK_EVERY_MS);
        return () => {
            document.removeEventListener('visibilitychange', check);
            clearInterval(timer);
        };
    }, [dispatch]);
};
