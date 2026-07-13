import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux'
import { EVCard } from '@workspace/april-ui'
import { AModal } from '@workspace/april-ui'
import React from 'react'
import { setUpdatingContactStatus } from '../../../model/EventContactThunk'
import { EV_CONTACT_TYPE } from '../../../type/event-contact-type'
import BaseFields from './BaseFields/BaseFields'
import { PBXContactStateItem } from '@/modules/entities/EventContact/type/pbx-contact-type'
import PbxFields from './PbxFields/PbxFields'

export default function EventContactUpdate({ type }: { type: EV_CONTACT_TYPE }) {
    const isUpdating = useAppSelector(state => state.contact.isUpdating)
    const dispatch = useAppDispatch()
    const setIsUpdating = () => dispatch(
        setUpdatingContactStatus(type, false)
    )
    const contact = useAppSelector(state => state.contact.current.contact)
    return (
        <AModal
            // type={type}
            isActive={isUpdating}
            color='black'
            cancel={setIsUpdating}
            size='lg'
        >
            <EVCard title={`Обновление контакта`}
                width={12}
                size={"full"}


            >
                <div className='d-flex flex-row gap-3 p-0 '>
                    {contact && <BaseFields
                        contact={contact as PBXContactStateItem}

                    />}
                    {contact && <PbxFields
                        contact={contact as PBXContactStateItem}
                    />}
                </div>
            </EVCard>
        </AModal>
    )
}
