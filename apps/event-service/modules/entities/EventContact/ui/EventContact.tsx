import { FC } from "react"
import { useAppDispatch, useAppSelector } from "@/modules/app/lib/hooks/redux"
import { eventContactActions } from "../model/EventContactSlice"
import { EventContactCreate } from "./components/EventContactCreate"
import { EV_CONTACT_TYPE } from "../type/event-contact-type"
import { ASelect } from "@workspace/april-ui"
import { ContactEventType } from "../type/state-contact-type"
import ContactActions from "./components/ContactAction"
import EventContactUpdate from "./components/EventContactUpdate/EventContactUpdate"

interface EventContactProps {
    type: EV_CONTACT_TYPE
}



export const EventContact: FC<EventContactProps> = ({
    type
}) => {

    const contacts = useAppSelector(state => state.contact.contacts)
    // const current = useAppSelector(state => state.contact.current.contact)
    const plan = useAppSelector(state => state.contact.current.plan)
    const report = useAppSelector(state => state.contact.current.report)
    const isReport = type == 'report'
    let current = plan
    if (isReport) {
        current = report
    }

    const dispatch = useAppDispatch();
    const setCurrent = (
        type: ContactEventType,
        contactId: string | number
    ) => {
        const id = contactId as number
        dispatch(
            eventContactActions
                .setCurrentContact({
                    type,
                    contactId: id
                })
        )
    }
    const contactState = useAppSelector(state => state.contact)

    const isContactCreating = contactState.isCreating

    const creatingType = contactState.creating.type

    const isCurrentCreating = creatingType === type
    const isUpdating = contactState.isUpdating

    // const setIsCreating = (
    //     isCreating: boolean) => dispatch(
    //         eventContactActions
    //             .setCreatingContact({
    //                 isCreating,
    //                 type
    //             })
    //     )

    return <>
        <ASelect
            current={current}
            items={contacts}
            withLabel
            label={isReport ? 'С кем велись переговоры' : "Контакт"}
            nameForHandler={type}
            handleChange={setCurrent}
            withAction={true}
            // action={setIsCreating}
            // actionProps={true}
            // actionType="add"
            ActionComponent={ContactActions}
            actionComponentProps={{ type }}

        />
        {isCurrentCreating && <EventContactCreate isActive={isContactCreating} type={type} />}
        {isUpdating && <EventContactUpdate type={type} />}
    </>
}

