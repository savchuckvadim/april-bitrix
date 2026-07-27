/** Каталог порогов живёт в entities/finance (нужен и Excel-выгрузке). */
export { HOT_THRESHOLDS } from '@/modules/entities/finance';

/** Фильтр «есть предложение»: с суммой строк / без / все. */
export type OfferFilter = 'all' | 'with' | 'without';

export const OFFER_OPTIONS: { value: OfferFilter; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'with', label: 'С предложением' },
    { value: 'without', label: 'Без предложения' },
];

/** Сентинелы «показать все» для клиентских фильтров перспективы и стадии. */
export const PERSPECTIVE_ALL = '__all__';
export const STAGE_ALL = '__all__';
