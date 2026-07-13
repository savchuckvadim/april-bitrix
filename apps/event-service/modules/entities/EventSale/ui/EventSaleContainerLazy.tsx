import { FC, Suspense, lazy, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/modules/app/lib/hooks/redux"
import { PreloaderCard } from "@/modules/shared/Preloader"
import { getSalePresentationsList } from "../model/EventSaleThunk";


export const EventSaleLazy = lazy(() => import('./EventSale'));


export const EventSaleContainer: FC = () => {

    const dispatch = useAppDispatch()

    const sale = useAppSelector(state => state.eventSale)
    const isSaleFetched = sale.isFetched
    const isPresItemsFetched = sale.presDeals.isItemsFetched


    const currentTask = useAppSelector(state => state.eventTask.current)

    if (currentTask && isSaleFetched && !isPresItemsFetched) {
        dispatch(getSalePresentationsList())
    }

    useEffect(() => {
        if (currentTask && isSaleFetched && !isPresItemsFetched) {
            dispatch(getSalePresentationsList())
        }
        
    }, [currentTask, isSaleFetched])

    return isSaleFetched

        ? <Suspense fallback={<PreloaderCard />}>
            <EventSaleLazy />
        </Suspense>


        : <PreloaderCard />
}

