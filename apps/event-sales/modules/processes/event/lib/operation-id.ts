/**
 * Идентификатор операции отправки. Отчёт — команда: по этому id бэкенд
 * отличает повтор от новой отправки и не выполняет flow дважды.
 *
 * `crypto.randomUUID` есть только в защищённом контексте (https/localhost).
 * Фрейм Битрикса всегда https, но dev по http встречается — поэтому фолбэк:
 * уникальности «в пределах одного клиента» здесь достаточно, id живёт минуты.
 */
export const createOperationId = (): string => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `op-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};
