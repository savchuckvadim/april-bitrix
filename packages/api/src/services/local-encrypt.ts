import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';

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
export async function  saveToLocalStorage(key: string, data: any, secret: string) {
    try {
        if (data) {
            const encryptedData = AES.encrypt(JSON.stringify(data), secret).toString(); // Шифруем данные

            localStorage.setItem(key, encryptedData); // Сохраняем данные в LocalStorage
        } else {
            clearFromLocalStorage(key)
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
    const storedData = localStorage.getItem(key);
    
    if (storedData) {
        
        try {
            // const parsedData = JSON.parse(storedData);

            const decryptedData = AES.decrypt(storedData, secret).toString(encUtf8);
            
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
export async function  clearFromLocalStorage(key: string) {
    try {
        localStorage.removeItem(key);
        console.log(`Data with key "${key}" has been removed from localStorage.`);

    } catch (e) {
        console.error(`Error removing data with key "${key}":`, e);
    }
}