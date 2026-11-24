import type { KContract } from '../../../catalog';
import type { RowPrice } from '../../model/types';

/**
 * Единица строки для колонки «Ед.» и подписей на экране — короткое имя меры
 * договора из справочника («мес.», «лиц. 6 мес.»).
 *
 * Строка хранит единицу на момент сборки, и слепок сделки сохраняет её как
 * есть: до 24.11.2026 справочник из Nest отдавал полное имя («Лицензия
 * 6 месяцев»), и оно осталось в сохранённых сделках. Справочник побеждает,
 * сохранённое имя — запасной вариант, когда договора в справочнике нет.
 */
export const measureNameOf = (
    price: Pick<RowPrice, 'measure'>,
    contract: Pick<KContract, 'measure'> | null | undefined,
): string => contract?.measure.name || price.measure.name;
