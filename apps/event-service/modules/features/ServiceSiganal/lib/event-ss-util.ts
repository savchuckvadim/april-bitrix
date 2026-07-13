import { getServiceSignalTaskGroupId } from "@workspace/pbx";
import { EV_SS_BXCHECKBOX, EV_SS_BXCHECKLIST, EV_SS_CheckList } from "../type/event-ss-type";

export const isServiceSignalTask = (domain: string, taskGroupId: number): boolean => {
    return taskGroupId == getServiceSignalTaskGroupId(domain);
}

export const extractSSReportUrl = (text: string): string => {
    const regex = /\[.*?\]\[B\]Не забудьте .*?\[url=(.*?)\]/i;
    const match = text.match(regex);
    return match ? match[1] : null;
}

export enum SS_SECTION_TITLE {
    INSTRUCTION = 'Инструкции по отработке',
    CLIENT_INFO_MOTIVATION = 'Информационный повод для обращения к пользователю:'
}

export const extractSSInstructionText = (text: string, sectionTitle: SS_SECTION_TITLE): string => {
    const regex = new RegExp(`\\[COLOR=.*?\\]\\[B\\]${sectionTitle}\\[\\/B\\]\\[\\/COLOR\\]\\s*([^\\[]+)`, 'is');
    const match = text.match(regex);
    return match ? match[1].replace(/\[.*?\]/g, '').trim() : null;
}


export const getCheckListsFromBX =
    (data: Array<EV_SS_BXCHECKLIST | EV_SS_BXCHECKBOX>): EV_SS_CheckList[] => {

        const bxCheckLists = data.filter(ch => ch.PARENT_ID === 0) as EV_SS_BXCHECKLIST[]
        const bxCheckBoxes = data.filter(ch => ch.PARENT_ID !== 0) as EV_SS_BXCHECKBOX[]

        const result = bxCheckLists.map((checklist: EV_SS_BXCHECKLIST) => {
            return {
                ...checklist,
                checkboxes: bxCheckBoxes.filter(checkbox => checkbox.PARENT_ID === checklist.ID)
            } as EV_SS_CheckList
        }) as EV_SS_CheckList[]

        return result
    }

export const getCompletedCheckList = (checklist: EV_SS_CheckList): number => {

    return checklist
        .checkboxes
        .filter(checbox => checbox.IS_COMPLETE == 'Y')
        .length
}