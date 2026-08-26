'use client';

import { FC } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { isWideDisplayMode } from '@/modules/app/lib/hooks/use-ui-density';
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

    // Встройка в задачу показывает тот же экран клиента: сущность у задачи уже
    // выбрана (task-primary-context), и работать в ней надо с тем же
    // контекстом — связями, историей, заявкой. Отличие только внутри секции
    // дел: отчитываемся по текущей задаче, остальные — ссылками.
    // Критерий общий с высоким хедером (isWideDisplayMode) — включаются вместе.
    return isWideDisplayMode(mode) ? <EntityBoardPage /> : <EventListPage />;
};

export default EventHomePage;
