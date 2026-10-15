import { formatDigestNumber, type DigestSale } from '@/modules/entities/digest';
import type { DigestTileData } from '../../lib/digest-tile';

const money = (value: number) => `${Math.round(value).toLocaleString('ru-RU')} ₽`;

/** Плитки продаж дня: количество, сумма, сколько с презентацией. */
export const buildSalesTiles = (sales: readonly DigestSale[]): DigestTileData[] => {
    const total = sales.reduce((sum, sale) => sum + sale.opportunity, 0);
    const withPres = sales.filter(sale => sale.presentations.length > 0).length;
    return [
        { key: 'count', label: 'Продаж за день', value: formatDigestNumber(sales.length), accent: 'text-success' },
        { key: 'sum', label: 'Сумма продаж', value: money(total), accent: 'text-success' },
        {
            key: 'withPres',
            label: 'С презентацией',
            value: formatDigestNumber(withPres),
            sub: 'есть сделка «ОП Презентации» с этой основной',
            accent: 'text-info',
        },
    ];
};

export const formatSaleMoney = money;
