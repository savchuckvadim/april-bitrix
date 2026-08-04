'use client';

import { FC } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { APP_DISPLAY_MODE } from '@/modules/app/types/app/app-type';
import EntityBoardPage from './EntityBoardPage';
import EventListPage from './EventListPage';

/**
 * Стартовый экран приложения зависит от того, куда его встроили.
 *
 * Во встройке таймлайна (`*_DETAIL_ACTIVITY`, режим TIMELINE) места много —
 * показываем карточку клиента целиком: сделки, лиды, история, дела. Во вкладке
 * карточки и в карточке звонка места мало и высота подгоняется под контент —
 * там остаётся привычный список событий.
 */
const EventHomePage: FC = () => {
    const mode = useAppSelector(s => s.app.display.mode);

    return mode === APP_DISPLAY_MODE.TIMELINE ? (
        <EntityBoardPage />
    ) : (
        <EventListPage />
    );
};

export default EventHomePage;
