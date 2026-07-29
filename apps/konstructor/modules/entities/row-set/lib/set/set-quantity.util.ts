import type { RowSet } from '../../model/types';
import { applyCommercialEdit } from '../price';

/**
 * Единое количество сета (легаси: quantity распространяется на все строки
 * группы). Исключение — quantityLocked (академия без monthQuantity).
 * Ручная правка total-строки сбрасывается: тотал перевыводится из строк.
 */
export const applySetQuantity = (set: RowSet, quantity: number): RowSet => ({
    ...set,
    totalPrice: null,
    rows: set.rows.map(row =>
        row.quantityLocked
            ? row
            : {
                  ...row,
                  price: applyCommercialEdit(row.price, {
                      kind: 'quantity',
                      value: quantity,
                  }),
              },
    ),
});
