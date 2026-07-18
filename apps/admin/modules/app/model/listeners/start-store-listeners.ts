import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { AppDispatch, RootState, ThunkExtraArgument } from '../store';

// Единственный листенер (инвалидация bitrix-client при смене портала) удалён
// вместе с легаси entities/bitrix — функция осталась точкой подключения
// будущих store-листенеров.
export function startStoreListeners(
    _listenerMiddleware: ListenerMiddlewareInstance<RootState, AppDispatch, ThunkExtraArgument>,
) {
    // листенеров пока нет
}
