'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    complectDescriptionBlocker,
    generateComplectDescription,
    selectComplectDescription,
} from '@/modules/entities/complect-description';

/** Кнопка «Описание комплекта»: блокер, запуск, ссылка на готовый файл. */
export const useComplectDescription = () => {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selectComplectDescription);
    const blocker = useAppSelector(complectDescriptionBlocker);

    return {
        blocker,
        isGenerating: state.status === 'loading',
        link: state.status === 'done' ? state.link : null,
        documentName: state.documentName,
        infoblocksCount: state.infoblocksCount,
        error: state.status === 'error' ? state.error : null,
        run: () => dispatch(generateComplectDescription()),
    };
};
