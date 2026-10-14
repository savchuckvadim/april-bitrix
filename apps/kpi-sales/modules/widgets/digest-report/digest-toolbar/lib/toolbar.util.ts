import { format } from 'date-fns';

/** «обновлено 10:15» из ISO-момента сборки; null — нет момента. */
export const formatGeneratedAt = (generatedAt: string | undefined): string | null => {
    if (!generatedAt) return null;
    const date = new Date(generatedAt);
    if (Number.isNaN(date.getTime())) return null;
    return `обновлено ${format(date, 'HH:mm')}`;
};
