import { IInfoBlock, IInfoBlockGroup, IServerInfoBlock } from "../type/infoblock.type"

export const sortIblocksByGroup = (infoblocks: IServerInfoBlock[]) => {
    const groups = [] as IInfoBlockGroup[]

    infoblocks.forEach(block => {
        if (block.group) {
            const group = groups.find(group => group.id === block.group?.id)
            if (group) {
                group.infoblocks.push({
                    ...block,
                    checked: false
                } as IInfoBlock)
            } else {
                groups.push({
                    ...block.group,
                    infoblocks: [block]
                } as IInfoBlockGroup)
            }
        }
    })
    return groups
}
