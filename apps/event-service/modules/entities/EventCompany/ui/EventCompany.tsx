import { EVCard } from "@workspace/april-ui"
import { FC, useState } from "react"





export const EventCompany: FC = ({


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

