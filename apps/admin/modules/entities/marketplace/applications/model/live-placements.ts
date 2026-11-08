/**
 * Живые привязки виджетов портала — как их видит Битрикс прямо сейчас
 * (`placement.get` через `GET admin/marketplace/portals/:id/placements/live`).
 */
export interface LivePlacementBinding {
    /** Место встройки (`CRM_DEAL_DETAIL_TAB`). */
    placement: string;
    handler: string;
    title: string | null;
    /** Привязка приложения April. */
    ours: boolean;
    /** Код виджета April; null — чужая привязка. */
    widget: string | null;
}

export interface LivePlacements {
    /** Битрикс отдал список привязок. */
    ok: boolean;
    /** Ответ Битрикса при ошибке. */
    error: string | null;
    bindings: LivePlacementBinding[];
}
