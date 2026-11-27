import type { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import {
    setupAcademyTermListener,
    setupRowSetSyncListener,
} from '@/modules/entities/row-set';

/** Реакции публичного стора: сборка та же, что во фрейме. */
export function startPublicListeners(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    setupRowSetSyncListener(listenerMiddleware);
    setupAcademyTermListener(listenerMiddleware);
}
