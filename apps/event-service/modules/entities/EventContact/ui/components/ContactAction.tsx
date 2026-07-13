
import React, { FC } from 'react';
import { EV_CONTACT_TYPE } from '../../type/event-contact-type';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { eventContactActions } from '../../model/EventContactSlice';
import { AIcon } from '@workspace/april-ui';
import { setUpdatingContactStatus } from '../../model/EventContactThunk';


export interface ContactActionProps {
    type: EV_CONTACT_TYPE
    create?: (props: boolean) => any;
    // cancel?: (props: boolean) => any;

}

const ContactActions: FC<ContactActionProps> = ({
    type,
    // create,
    // cancel,
}) => {
    const dispatch = useAppDispatch()
    const cancel = () => {

        dispatch(eventContactActions.setCurrentContact({
            type,
            contactId: null
        }))
    }
    const setIsCreating = () => dispatch(
        eventContactActions
            .setCreatingContact({
                isCreating: true,
                type
            })
    )
    const setIsUpdating = () => dispatch(
        setUpdatingContactStatus(type, true)
    )
    const hasCurrent = useAppSelector(state => state.contact.current[type])
    return (
        <div
            style={{
                width: hasCurrent ? '60px' : '20px',
            }}
            className='d-flex justify-content-between align-items-center'>
            {hasCurrent && <AIcon
                action={setIsUpdating}
                type={'update'}

            />
            }
            <AIcon
                action={setIsCreating}
                type={'add'}

            />

            {hasCurrent && <AIcon
                action={cancel}
                type={'cancel'}

            />}
        </div>

    );
}

export default ContactActions;