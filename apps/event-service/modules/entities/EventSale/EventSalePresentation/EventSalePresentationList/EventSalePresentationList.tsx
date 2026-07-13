import { FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { eventSaleActions } from '../../model/EventSaleSlice';
import { BXDeal } from '@workspace/bx';
import { ABadge } from '@workspace/april-ui';

const EventSalePresentationList: FC = () => {
    const dispatch = useAppDispatch();

    const showSalePresentation = (dealId: number) => {};
    const setCurrentSalePresentation = (dealId: number) => {
        dispatch(eventSaleActions.setCurrentPresItem({ dealId, type: 'current' }));
    };

    const sale = useAppSelector(state => state.eventSale);
    const presntationDeals = sale.presDeals.items;
    const currentPresntationDeal = sale.presDeals.current;

    return (
        <div className="flex flex-col gap-2">
            {presntationDeals &&
                presntationDeals.length > 0 &&
                presntationDeals.map((deal: BXDeal, i: number) => {
                    const title = deal.TITLE;
                    const isActive = currentPresntationDeal && currentPresntationDeal.ID === deal.ID;
                    const setPresentationSale = () => setCurrentSalePresentation(deal.ID);
                    return (
                        <div
                            key={`sale-pres-${deal.ID}`}
                            className="flex items-center justify-between gap-2 rounded-lg border border-border p-2"
                        >
                            <p
                                className="m-0 cursor-pointer text-sm text-foreground"
                                onClick={() => showSalePresentation(deal.ID)}
                            >
                                {title}
                            </p>
                            <ABadge
                                title={isActive ? '' : 'Связать'}
                                color={'april'}
                                size="small"
                                isActive={!!isActive}
                                isIconeDone={!!isActive}
                                clickHendler={setPresentationSale}
                            />
                        </div>
                    );
                })}
        </div>
    );
};

export default EventSalePresentationList;
