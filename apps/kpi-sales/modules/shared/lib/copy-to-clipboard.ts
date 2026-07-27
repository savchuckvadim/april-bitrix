/**
 * Копирование в буфер, живучее во фрейме Bitrix: `navigator.clipboard`
 * в cross-origin iframe заблокирован permissions policy (родитель не
 * делегирует clipboard-write), поэтому фолбэк — скрытый textarea +
 * `document.execCommand('copy')`, которому policy не указ (нужен только
 * жест пользователя). Возвращает успех фактического копирования.
 */
export const copyTextToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // iframe без clipboard-write / нет transient activation — фолбэк
    }
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        return copied;
    } catch {
        return false;
    }
};
