export interface DealSummaryActionsInput {
    /** Сделка уже есть в приложении (во фрейме сделки или создана из компании) */
    hasDeal: boolean;
    /** Есть что отправлять: собран главный товар */
    canSend: boolean;
}

export interface DealSummaryActions {
    /** Кнопка «Сохранить / Создать сделку» в карточке «Итог» */
    showDealSend: boolean;
    /** Вид кнопки: сделка есть — запасное действие рядом с «Далее», сделки нет — главное */
    dealSendVariant: 'default' | 'outline';
    /** «Далее: Документ»: документам нужна сделка, поэтому без неё кнопки нет */
    showNext: boolean;
}

/**
 * Что стоит под суммой в «Итоге» шага «Цены»: со сделкой — «Сохранить сделку»
 * рядом с «Далее», чтобы сохранение не забывали; без сделки (карточка компании
 * без открытой сделки) — «Создать сделку» вместо «Далее». Нечего отправлять —
 * кнопки сделки нет и «Далее» остаётся, как было.
 */
export const dealSummaryActions = ({
    hasDeal,
    canSend,
}: DealSummaryActionsInput): DealSummaryActions => ({
    showDealSend: canSend,
    dealSendVariant: hasDeal ? 'outline' : 'default',
    showNext: hasDeal || !canSend,
});
