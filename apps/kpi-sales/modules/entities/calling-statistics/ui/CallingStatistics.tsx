

import CallingTable from "./components/CallingTable"
import { useCallingStatistics } from "../lib/hooks/useCallingStatistics"
import { Preloader } from "@/modules/shared"
import CallingDashboard from "./components/CallingDashboard"
const CallingStatistics = () => {
    const { isLoading, data } = useCallingStatistics()
    if (isLoading) return <div className='min-w-full h-[500px] flex justify-center items-center'><Preloader size='large' /></div>
    if (!data) return null

    return (
        <div className="w-full h-full">
            <div className="mt-5 p-1 flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary">Статистика по звонкам</h2>
                
            </div>
            <CallingTable data={data} />
            <CallingDashboard report={data} />
        </div>

    )


}

export default CallingStatistics