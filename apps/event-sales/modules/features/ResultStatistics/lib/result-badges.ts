import { CallResults } from '@/modules/features/NoCall';

/** Конфигурация бэйджей статистики (данные отдельно от UI). */
export const RESULT_BADGES: Array<{
    key: keyof CallResults;
    label: string;
    className: string;
}> = [
    { key: 'resultCount', label: 'результативных', className: 'bg-success text-success-foreground' },
    { key: 'noresultCount', label: 'недозвонов', className: 'bg-warning text-warning-foreground' },
    { key: 'presentationCount', label: 'презентаций', className: 'bg-event-pres text-event-pres-foreground' },
    { key: 'inProgressCount', label: 'в работе', className: 'bg-event-hot text-event-hot-foreground' },
    { key: 'inMoneyCount', label: 'оплата', className: 'bg-event-money text-event-money-foreground' },
];
