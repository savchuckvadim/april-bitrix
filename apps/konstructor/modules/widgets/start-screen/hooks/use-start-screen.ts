'use client';

import {
    ROUTE_KONSTRUCTOR,
    useKonstructorNavigation,
} from '@/modules/shared/lib/routing';
import { START_ACTIONS } from '../lib/start-actions';

export const useStartScreen = () => {
    const nav = useKonstructorNavigation();

    return {
        actions: START_ACTIONS,
        open: (route: ROUTE_KONSTRUCTOR) => nav.to(route),
    };
};
