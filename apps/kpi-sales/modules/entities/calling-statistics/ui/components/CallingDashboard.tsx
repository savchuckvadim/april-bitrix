
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { ReportCallingData } from "../../type/calling-type"

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import BitrixCallingsChart from "@/modules/entities/report/ui/chartjs/BitrixCallingsChart";
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);
const CallingDashBoard = ({ report }: { report: ReportCallingData[] }) => {


    return (
        <Card className='bg-card text-primary'>
            <CardHeader>
                <CardTitle>Статистика звонков</CardTitle>
            </CardHeader>
            <CardContent>

                <BitrixCallingsChart dataColors='[
                            "rgba(133, 212, 212, 1)" ,
                            "rgba(106, 180, 242, 1)", 
                            "rgba(14, 201, 111, 0.8)", 
                            "rgba(20, 191, 213, 0.8)", 
                            "rgba(151, 103, 200, 0.8)", 
                            "rgba(104, 54, 153, 0.8)", 
                            "rgba(255, 13, 334, 0.8)", 
                            "rgba(104, 54, 253, 0.8)",
                            "rgba(151, 103, 200, 0.8)",
                            "rgba(20, 191, 213, 0.8)", 
                            "rgba(14, 201, 111, 0.8)"]'
                    report={report}
                    part={1}

                />
            </CardContent>
        </Card>
    )
}


export default CallingDashBoard