import { FC, useState } from "react"
import { EV_REPORT_PROP, EventReportStateReport } from "../type/event-report-type"

import { EVCard } from "@workspace/april-ui"




export const EventSupply: FC = ({


}) => {


    return <EVCard
        title="Компания"
        width={12}
        children={
            <div>
                Компания
                {/* <ASelect
            current={0}
            nameForHandler=""
            /> */}
            </div>
        }
        size="medium"
        key={1}
    />
}

