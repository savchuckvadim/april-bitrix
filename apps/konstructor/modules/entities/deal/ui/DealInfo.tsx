'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { SimpleCard, SimpleStatisticsCard } from '@/modules/shared';

const getBooleanFieldValue = (value: string | number | string[] | number[]) => {
    return value === '0' || value === 0 ? 'Нет' : value === '1' || value === 1 ? 'Да' : value;
};
export const DealInfo = () => {
    const {  } = useAppSelector(state => state.deal);
    const isUp = true;
    return (
        <div>
            <SimpleStatisticsCard color={isUp ? 'green' : 'red'} value={100} title="Заявка">

            </SimpleStatisticsCard>
        </div>
    );
};
