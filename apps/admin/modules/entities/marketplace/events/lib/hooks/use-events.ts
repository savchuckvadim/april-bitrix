'use client';

import { useQuery } from '@tanstack/react-query';
import {
    AppEventsPageDto,
    MarketplaceModerationGetEventsParams,
} from '@workspace/nest-admin-api';
import { EventsHelper } from '../api/events-helper';

const helper = new EventsHelper();

/** Страница журнала событий приложения; ключ запроса включает фильтры и skip. */
export const useAppEvents = (params: MarketplaceModerationGetEventsParams) => {
    return useQuery<AppEventsPageDto, Error>({
        queryKey: [
            'marketplace-events',
            params.domain ?? '',
            params.memberId ?? '',
            params.event ?? '',
            params.status ?? '',
            params.take ?? 50,
            params.skip ?? 0,
        ],
        queryFn: () => helper.list(params),
        placeholderData: (prev) => prev,
    });
};
