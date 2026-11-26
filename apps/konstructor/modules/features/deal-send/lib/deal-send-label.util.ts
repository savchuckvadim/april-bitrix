export interface DealSendLabelInput {
    /** Сделка уже есть в приложении */
    hasDeal: boolean;
    isSending: boolean;
    /** Ждём ответ бэка (`request`) или запись полей в сделку (`write`) */
    phase: 'request' | 'write' | null;
}

/** Подпись кнопки «Создать / Сохранить сделку» по состоянию отправки. */
export const dealSendLabel = ({ hasDeal, isSending, phase }: DealSendLabelInput): string => {
    if (!isSending) return hasDeal ? 'Сохранить сделку' : 'Создать сделку';
    if (phase === 'write') return 'Записываю в сделку…';
    return hasDeal ? 'Отправляю…' : 'Создаю сделку…';
};
