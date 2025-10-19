import { APP_GROUPS, APP_TYPES, STATUSES } from './constants';

export const getAppGroupLabel = (group: string): string => {
    const labels = {
        [APP_GROUPS.SALES]: 'Продажи',
        [APP_GROUPS.SERVICE]: 'Сервис',
        [APP_GROUPS.MARKETING]: 'Маркетинг',
        [APP_GROUPS.SUPPORT]: 'Поддержка',
        [APP_GROUPS.ANALYTICS]: 'Аналитика'
    };
    return labels[group as keyof typeof labels] || group;
};

export const getAppTypeLabel = (type: string): string => {
    const labels = {
        [APP_TYPES.WIDGET]: 'Виджет',
        [APP_TYPES.WEBHOOK]: 'Вебхук',
        [APP_TYPES.INTEGRATION]: 'Интеграция'
    };
    return labels[type as keyof typeof labels] || type;
};

export const getStatusLabel = (status: string): string => {
    const labels = {
        [STATUSES.NOT_INSTALLED]: 'Не установлен',
        [STATUSES.INSTALLING]: 'Устанавливается',
        [STATUSES.INSTALLED]: 'Установлен',
        [STATUSES.ERROR]: 'Ошибка'
    };
    return labels[status as keyof typeof labels] || status;
};

export const getStatusColor = (status: string): string => {
    const colors = {
        [STATUSES.NOT_INSTALLED]: 'bg-gray-100 text-gray-800 border-gray-200',
        [STATUSES.INSTALLING]: 'bg-blue-100 text-blue-800 border-blue-200',
        [STATUSES.INSTALLED]: 'bg-green-100 text-green-800 border-green-200',
        [STATUSES.ERROR]: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
};
