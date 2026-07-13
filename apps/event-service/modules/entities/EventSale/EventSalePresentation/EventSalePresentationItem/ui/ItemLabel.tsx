import { FC } from 'react';
import { ABadge } from '@workspace/april-ui';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { eventSaleActions } from '@/modules/entities/EventSale/model/EventSaleSlice';

const EventSalePresentationItemLabel: FC = () => {
    const dispatch = useAppDispatch();
    const back = () => {
        dispatch(eventSaleActions.setCurrentPresItem({ dealId: null, type: 'show' }));
    };

    return (
        <div className="flex items-center gap-2">
            <ABadge title={'связать'} color={'april'} size="small" />
            <ABadge title={'назад'} color={'orange'} size="small" isActive clickHendler={back} />
        </div>
    );
};

export default EventSalePresentationItemLabel;
