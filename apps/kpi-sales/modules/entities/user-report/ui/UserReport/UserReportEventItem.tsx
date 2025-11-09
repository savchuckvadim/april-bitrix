'use client'

import { IUserReportItem } from "../../type/user-report.type";
import { Card } from "@workspace/ui/components/card";


export const UserReportEventItem = ({ item, idx }: { item: IUserReportItem; idx: number }) => {
    return (
        <Card
            key={item.id ?? idx}
            className="p-3 hover:bg-muted/40 transition rounded-2xl shadow-sm border border-gray-100"
        >
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <h3 className="text-sm text-gray-600 font-medium">
                        {item.sales_kpi_event_action?.fieldName}
                    </h3>
                    <p>{item.sales_kpi_event_action?.value?.name}</p>
                </div>
                <div>
                    <h3 className="text-sm text-gray-600 font-medium">
                        {item.sales_kpi_event_type?.fieldName}
                    </h3>
                    <p>{ item.sales_kpi_event_type?.value?.name}</p>
                </div>
            </div>
        </Card>
    );
}
