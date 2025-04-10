import { AES } from "crypto-js";
import encUtf8 from "crypto-js/enc-utf8";
import { BXUser } from "@workspace/bx";


export function getDepartmentKey() {
  const today = new Date();
  const formattedDate = `${today.getMonth() + 1}${today.getDate()}${today.getFullYear()}`;
  return `department_${formattedDate}`;
}

// Функция для сохранения данных в LocalStorage
// Функция для сохранения данных в LocalStorage
export function saveDepartmentToLocalStorage(department: BXUser[], domain: string) {
  try {
    const encryptedData = AES.encrypt(JSON.stringify(department), domain).toString(); // Шифруем данные

    const dataToStore = {
      department: encryptedData, // Зашифрованные данные департамента
      lastUpdated: new Date().toISOString(), // Текущая дата и время
    };

    localStorage.setItem("department_event", JSON.stringify(dataToStore)); // Сохраняем данные в LocalStorage
  } catch (e) {
    console.error("Error saving data:", e);
  }
}

// Функция для проверки наличия данных в LocalStorage
export function getDepartmentFromLocalStorage(domain: string) {
  const storedData = localStorage.getItem("department_event");
  if (storedData) {
    try {
      const parsedData = JSON.parse(storedData);

      // Проверяем, есть ли поле с датой обновления
      if (parsedData && parsedData.lastUpdated) {
        const storedDate = new Date(parsedData.lastUpdated);
        const today = new Date().toDateString(); // текущая дата в формате строки

        // Если дата в LocalStorage совпадает с сегодняшней, возвращаем данные
        if (storedDate.toDateString() === today) {
          const decryptedData = AES.decrypt(parsedData.department, domain).toString(encUtf8);
          // console.log('department from local')

          return JSON.parse(decryptedData); // Возвращаем расшифрованные данные департамента
        }
      }
    } catch (e) {
      console.error("Error parsing or decrypting data:", e);
      return null; // Если произошла ошибка при расшифровке или парсинге
    }
  }
  return null; // Если данных нет или они устарели
}

// Основная функция для работы с API и LocalStorage
