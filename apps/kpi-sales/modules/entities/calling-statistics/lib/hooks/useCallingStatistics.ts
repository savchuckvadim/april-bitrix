import { useAppSelector } from '@/modules/app/lib/hooks/redux';

export const useCallingStatistics = () => {
    const isLoading = useAppSelector(
        state => state.callingStatistics.isLoading,
    );
    // Приходил ли ответ (в том числе пустой/с ошибкой): до него данных нет
    // не потому, что звонков нет, а потому что их ещё не загрузили.
    const isFetched = useAppSelector(
        state => state.callingStatistics.isFetched,
    );
    const data = useAppSelector(state => state.callingStatistics.items);

    return { data, isLoading, isFetched };
};
