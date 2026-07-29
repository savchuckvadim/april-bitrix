'use client';

import {
    discountDisplayValue,
    quantityFieldLabel,
    type CommercialEdit,
    type RowPrice,
} from '@/modules/entities/row-set';
import type { KContract } from '@/modules/entities/catalog';
import { CommercialNumberInput } from './CommercialNumberInput';

export interface CommercialDisabled {
    price: boolean;
    quantity: boolean;
    discount: boolean;
    sum: boolean;
}

interface CommercialInputsProps {
    price: RowPrice;
    contract: KContract | null;
    disabled: CommercialDisabled;
    onCommit: (edit: CommercialEdit) => void;
    onToggleDiscountMode: () => void;
}

const formatMoney = (value: number) =>
    value.toLocaleString('ru-RU', { maximumFractionDigits: 2 });

/**
 * Четыре ячейки коммерции (легаси row__cells): Цена (с подписью «в месяц»),
 * Количество|Аванс (с мерой «абон. 12 мес.»), Скидка (₽/%), Сумма.
 */
export const CommercialInputs = ({
    price,
    contract,
    disabled,
    onCommit,
    onToggleDiscountMode,
}: CommercialInputsProps) => (
    <div className="flex flex-wrap items-start gap-2">
        <CommercialNumberInput
            field="price"
            label="Цена"
            price={price}
            displayValue={price.current}
            disabled={disabled.price}
            onCommit={onCommit}
            hint={
                price.measure.type > 1
                    ? `${formatMoney(price.month)} ₽/мес`
                    : undefined
            }
        />
        <CommercialNumberInput
            field="quantity"
            label={quantityFieldLabel(contract)}
            price={price}
            displayValue={price.quantity}
            disabled={disabled.quantity}
            onCommit={onCommit}
            hint={price.measure.name || undefined}
        />
        <CommercialNumberInput
            field="discount"
            label="Скидка"
            price={price}
            displayValue={discountDisplayValue(price)}
            disabled={disabled.discount}
            onCommit={onCommit}
            adornment={
                <button
                    type="button"
                    onClick={onToggleDiscountMode}
                    disabled={disabled.discount}
                    className="rounded bg-muted px-1 font-mono text-[10px] text-foreground hover:bg-accent"
                    title="Переключить ₽/%"
                >
                    {price.discount.current === 'percent' ? '%' : '₽'}
                </button>
            }
        />
        <CommercialNumberInput
            field="sum"
            label="Сумма"
            price={price}
            displayValue={price.sum}
            disabled={disabled.sum}
            onCommit={onCommit}
            hint={
                price.base !== price.current
                    ? `без скидки ${formatMoney(price.base * price.quantity)} ₽`
                    : undefined
            }
        />
    </div>
);
