// Глубокий импорт файла констант: баррель pbx-data тянет class-энтити
import { PBX_SALES_KONSTRUCTOR_FIELD_CODES } from '@workspace/pbx-data/entities/field/type/sales/konstructor/pbx-sales-konstructor-field.type';

/** Поля счёта на экране КП, которые пишутся в сделку. */
export type InvoiceDealField = 'invoiceDate' | 'invoiceNumber';

/**
 * pbx-коды полей сделки под дату и номер счёта. Даты первой оплаты читает и
 * пишет ещё экран договора; номера счёта в каноне konstructor нет, он
 * читается по коду, который портал заводит сам. Нет поля на портале — запись
 * молча пропускается (см. saveOfferInvoiceField).
 */
export const INVOICE_DEAL_FIELD_CODE: Record<InvoiceDealField, string> = {
    invoiceDate: PBX_SALES_KONSTRUCTOR_FIELD_CODES.first_pay_date,
    invoiceNumber: 'invoice_number',
};

/** Значение с экрана → значение поля сделки: input[type=date] уже в формате Bitrix, пусто — ''. */
export const toInvoiceDealValue = (value: string): string => value.trim();
