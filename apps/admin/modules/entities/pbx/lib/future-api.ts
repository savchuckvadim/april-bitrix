/**
 * Placeholders for pbx-install operations that don't exist on the backend yet:
 * synchronising a single field/stage/item and editing it in **only** Bitrix or
 * **only** PortalDB. The UI exposes the affordances now; these stubs produce a
 * uniform "not implemented" message until the endpoints land.
 */
export const FUTURE_API_NOTE =
    'Точечная синхронизация / правка только в Bitrix или только в Portal появится, когда добавят соответствующее API на бэке.';

export type SingleStoreTarget = 'bitrix' | 'portal';

export function futureApiMessage(action: string, target?: SingleStoreTarget): string {
    const where =
        target === 'bitrix'
            ? ' (только Bitrix)'
            : target === 'portal'
              ? ' (только Portal)'
              : '';
    return `«${action}${where}» — пока не реализовано на бэке. ${FUTURE_API_NOTE}`;
}
