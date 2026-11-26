import { APP_DEP } from '../model/AppSlice';

/**
 * Признак «сообщить о документе в поток продаж» в запросах документов
 * (КП в Word и PDF, договор, запуск поставки). Бэк читает его необязательным
 * полем `salesFlow`; сгенерированный клиент его пока не знает, поэтому тип
 * расширяет запросы руками. После `pnpm run generate` расширение можно убрать.
 */
export interface SalesFlowFields {
    salesFlow?: boolean;
}

/**
 * Поле `salesFlow` запроса документа: `true` только у отдела продаж. У
 * сервисного отдела поля нет совсем, бэк его документы в поток продаж не
 * ставит.
 */
export const salesFlowFields = (department: APP_DEP): SalesFlowFields =>
    department === APP_DEP.SALES ? { salesFlow: true } : {};
