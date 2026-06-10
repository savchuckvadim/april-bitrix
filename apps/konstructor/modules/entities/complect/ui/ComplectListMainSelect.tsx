'use client'
import { Button } from "@workspace/ui"
import { useProfComplects } from "../lib/hooks/prof-complects.hook"
import { IComplect } from "../type/complect.type"

const ComplectItem = ({ complect, isCurrent }: { complect: IComplect, isCurrent: boolean }) => {
    return (
        <Button
            variant={isCurrent ? "default" : "outline"}
            size="sm"
            //@ts-ignore



        >
            {complect.name}
        </Button>
    )
}
export function ComplectListMainSelect() {
    const { prof, isLoading } = useProfComplects()
    if (isLoading) return <div>Loading...</div>
    if (!prof) return <div>No prof</div>
    const filtredRows = prof.map(complect => complect)
    prof.map((complect, i) => {
        if (complect && !i) {
            filtredRows.push(complect)
        }
    })
    return (
        <div className="grid grid-flow-col grid-rows-2 gap-2 [grid-auto-columns:minmax(0,1fr)]">
            {
                filtredRows && filtredRows.map((complect, i) => (
                    <ComplectItem
                        key={complect.number}
                        complect={complect}
                        isCurrent={i === 2} />
                ))
            }
        </div>
    )
}
