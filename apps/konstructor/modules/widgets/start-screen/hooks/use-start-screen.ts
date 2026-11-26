'use client';

import { useKonstructorNavigation } from '@/modules/shared/lib/routing';
import { START_ACTIONS, startActionRoute, type StartAction } from '../lib/start-actions';

export const useStartScreen = () => {
    const nav = useKonstructorNavigation();

    return {
        actions: START_ACTIONS,
        open: (action: StartAction) => {
            const route = startActionRoute(action);
            if (route) nav.to(route);
        },
    };
};
