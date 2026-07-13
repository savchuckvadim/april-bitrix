import { FC } from "react"
import { EVCard } from "@workspace/april-ui"
import { ABadge } from "@workspace/april-ui"
import EventSalePresentationList from "../EventSalePresentation/EventSalePresentationList/EventSalePresentationList"
import { useAppDispatch, useAppSelector } from "@/modules/app/lib/hooks/redux"
import EventSalePresentationItem from "../EventSalePresentation/EventSalePresentationItem/ui/EventSalePresentationItem"
import EventSalePresentationItemLabel from "../EventSalePresentation/EventSalePresentationItem/ui/ItemLabel"
import { eventSaleActions } from "../model/EventSaleSlice"



const EventSale: FC = () => {

    const dispatch = useAppDispatch()
    const sale = useAppSelector(state => state.eventSale)
    const isCurrentShow = sale.presDeals.show || false

    const clear = () => {
        dispatch(
            eventSaleActions
                .setCurrentPresItem({ dealId: null, type: 'current' })
        )
    }

    const actionComponent = !isCurrentShow ? <ABadge
        title={'Очистить'}
        color={'warning'}
        size="small"
        clickHendler={clear}

    />
        : <EventSalePresentationItemLabel />

       





    return <EVCard
        title={!isCurrentShow ? 'Связи Продажи' : 'Связать Продажу с презентацией'}
        width={12} size="big"
        actionComponent={actionComponent}
    >

        <div

            className="d-flex flex-column justify-content-start align-items-start p-0">


            {!isCurrentShow
                ? <EventSalePresentationList />
                : <EventSalePresentationItem />
            }

        </div>

    </EVCard >

}

export default EventSale