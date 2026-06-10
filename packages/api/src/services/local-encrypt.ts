import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';

/**
 * Очистка старых данных из localStorage для указанного префикса.
 * Удаляет все ключи старше текущего месяца (для ежемесячного обновления).
 * @param prefix Префикс для поиска ключей
 */
export const clearOldStorageKeys = (prefix: string) => {
    // Проверяем, что мы в браузере
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }

    try {
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 1-12
        const currentYear = today.getFullYear();

        // Формат ключа: PREFIX_MMDDYYYY (например: KONSTRUCTOR_INIT_1122024 или KONSTRUCTOR_INIT_1212024)
        // Проблема: сложно точно определить границу между месяцем и днем
        // Решение: проверяем все возможные комбинации месяца (1-12) в начале строки
        const prefixPattern = `${prefix}_`;

        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);

            if (key && key.startsWith(prefixPattern)) {
                const datePart = key.replace(prefixPattern, '');
                const year = parseInt(datePart.slice(-4)); // Последние 4 цифры - год

                // Проверяем все возможные варианты месяца (1-12)
                let monthFound = false;
                let shouldRemove = true;

                // Пробуем месяцы от 1 до 12
                for (let month = 1; month <= 12; month++) {
                    const monthStr = month.toString();
                    // Проверяем, начинается ли дата с этого месяца
                    if (datePart.startsWith(monthStr)) {
                        const remaining = datePart.slice(monthStr.length);
                        // Остаток должен быть днем (1-2 цифры) + год (4 цифры) = минимум 5 цифр
                        if (remaining.length >= 5 && remaining.length <= 6) {
                            monthFound = true;
                            // Проверяем, совпадает ли месяц и год с текущими
                            if (month === currentMonth && year === currentYear) {
                                shouldRemove = false; // Оставляем этот ключ
                            }
                            break;
                        }
                    }
                }

                // Удаляем ключи, которые не относятся к текущему месяцу
                if (shouldRemove) {
                    localStorage.removeItem(key);
                    console.log(`🗑 Removed old storage key: ${key}`);
                }
            }
        }
    } catch (e) {
        console.error(`Error clearing old storage keys for prefix "${prefix}":`, e);
    }
};
/**
 * Генерация ключа для хранения данных в localStorage с учетом текущей даты.
 * @param prefix Префикс для ключа
 * @returns Сгенерированный ключ
 */
export function getStorageKey(prefix: string) {
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}${today.getDate()}${today.getFullYear()}`;
    return `${prefix}_${formattedDate}`;
}

/**
 * Сохранение данных в localStorage в зашифрованном виде.
 * @param key Ключ для хранения
 * @param data Данные для сохранения
 * @param secret Секретный ключ для шифрования
 */
export async function saveToLocalStorage(
    key: string,
    data: any,
    secret: string,
) {
    try {
        // Проверяем, что мы в браузере
        if (typeof window === 'undefined' || !window.localStorage) {
            return;
        }

        if (data) {
            const encryptedData = AES.encrypt(
                JSON.stringify(data),
                secret,
            ).toString(); // Шифруем данные

            localStorage.setItem(key, encryptedData); // Сохраняем данные в LocalStorage
        } else {
            clearFromLocalStorage(key);
        }
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

/**
 * Получение данных из localStorage с расшифровкой.
 * @param key Ключ для получения данных
 * @param secret Секретный ключ для дешифрования
 * @returns Расшифрованные данные или null, если данные отсутствуют или устарели
 */
export async function getFromLocalStorage(key: string, secret: string) {
    // Проверяем, что мы в браузере
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }

    const storedData = localStorage.getItem(key);

    if (storedData) {
        try {
            // const parsedData = JSON.parse(storedData);

            const decryptedData = AES.decrypt(storedData, secret).toString(
                encUtf8,
            );

            return JSON.parse(decryptedData); // Возвращаем расшифрованные данные
        } catch (e) {
            console.error('Error parsing or decrypting data:', e);
            return null;
        }
    }
    return null;
}

/**
 * Очистка данных из localStorage по ключу.
 * @param key Ключ для удаления данных
 */
export async function clearFromLocalStorage(key: string) {
    try {
        // Проверяем, что мы в браузере
        if (typeof window === 'undefined' || !window.localStorage) {
            return;
        }

        localStorage.removeItem(key);
        console.log(
            `Data with key "${key}" has been removed from localStorage.`,
        );
    } catch (e) {
        console.error(`Error removing data with key "${key}":`, e);
    }
}

/**
 * Удаляет устаревшие ключи localStorage с датой в суффиксе (как у {@link getStorageKey}).
 * Оставляет только ключ за «сегодня» для данного префикса (`portal_cache`, `provider_cache`, …).
 */
export function removeOldPortalCache(prefix: string): void {
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }
    try {
        const todayKey = getStorageKey(prefix);

        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);

            if (key && key.startsWith(prefix) && key !== todayKey) {
                localStorage.removeItem(key);
                console.log(`Removed old dated storage key: ${key}`);
            }
        }
    } catch (e) {
        console.error(`Error removing old keys for prefix "${prefix}":`, e);
    }
}
