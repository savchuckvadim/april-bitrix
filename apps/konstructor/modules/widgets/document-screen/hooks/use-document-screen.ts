'use client';

import {
    findDocumentKind,
    ROUTE_KONSTRUCTOR,
    useKonstructorNavigation,
    type DocumentKind,
} from '@/modules/shared/lib/routing';

export const useDocumentScreen = (kind: DocumentKind) => {
    const nav = useKonstructorNavigation();

    return {
        info: findDocumentKind(kind),
        // КП делается по Word-шаблону — их настройка уже доступна
        withTemplates: kind === 'offer',
        toHub: () => nav.to(ROUTE_KONSTRUCTOR.DOCUMENT),
        toSettings: () => nav.to(ROUTE_KONSTRUCTOR.SETTINGS),
    };
};
