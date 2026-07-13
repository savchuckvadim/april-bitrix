import React from 'react'
import { EV_BASE_CONTACT_ITEM_PROP, PBXContactStateItem } from '../../../../type/pbx-contact-type'
import { useAppDispatch } from '@/modules/app/lib/hooks/redux'
import { eventContactActions } from '@/modules/entities/EventContact/model/EventContactSlice'
import { AInput, APhoneInput, AText } from '@workspace/april-ui'
type LocalEventValueType = React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>

export default function BaseFields({ contact }: { contact: PBXContactStateItem }) {
    const dispatch = useAppDispatch()
    const setValue = (value: string, prop: EV_BASE_CONTACT_ITEM_PROP) => {
        dispatch(eventContactActions.setBaseProp({ value, propName: prop }))
    }
    const flds = [
        {
            label: "Имя",
            code: EV_BASE_CONTACT_ITEM_PROP.NAME,
            value: contact.NAME || '' as string,
            onChange: (e: LocalEventValueType) =>
                setValue(e.target.value, EV_BASE_CONTACT_ITEM_PROP.NAME),
        } as const,
        {
            label: "Должность",
            code: EV_BASE_CONTACT_ITEM_PROP.POST,
            value: contact.POST || '' as string,
            onChange: (e: LocalEventValueType) =>
                setValue(e.target.value, EV_BASE_CONTACT_ITEM_PROP.POST),
        } as const,

        {
            label: "Телефон",
            code: EV_BASE_CONTACT_ITEM_PROP.PHONE,
            value: Array.isArray(contact.PHONE) && typeof contact.PHONE[0] === 'object' ? contact.PHONE[0]?.VALUE : contact.PHONE as string,
            onChange: (e: LocalEventValueType) =>
                setValue(e.target.value, EV_BASE_CONTACT_ITEM_PROP.PHONE),
        } as const,
        {
            label: "Email",
            code: EV_BASE_CONTACT_ITEM_PROP.EMAIL,
            value: Array.isArray(contact.EMAIL) && typeof contact.EMAIL[0] === 'object' ? contact.EMAIL[0]?.VALUE : contact.EMAIL as string,
            onChange: (e: LocalEventValueType) =>
                setValue(e.target.value, EV_BASE_CONTACT_ITEM_PROP.EMAIL),
        } as const,
        {
            label: "Описание",
            code: EV_BASE_CONTACT_ITEM_PROP.COMMENTS,
            value: contact.COMMENTS as string,
            onChange: (value: string) =>
                setValue(value, EV_BASE_CONTACT_ITEM_PROP.COMMENTS),
        } as const,
    ];

    return (
        <div 
        style={{
            'width': '50%'
        }}
        >
            {flds.map(fld => {
                switch (fld.code) {
                    case EV_BASE_CONTACT_ITEM_PROP.PHONE:
                        return <APhoneInput
                            key={fld.code}
                            label={fld.label}
                            currentValue={fld.value}
                            handleChange={(type: EV_BASE_CONTACT_ITEM_PROP, value: string) => { fld.onChange({ target: { value } } as LocalEventValueType) }}
                            errorMessage={null}
                            nameForHandler={fld.code}
                            handleOnFocus={(type: EV_BASE_CONTACT_ITEM_PROP, error: string) => { /* handle focus logic here */ }}
                        />
                    case EV_BASE_CONTACT_ITEM_PROP.COMMENTS:
                        return <AText
                            current={fld.value}
                            handleBlur={() => { }}
                            label={fld.label}
                            nameForHandler={fld.code}
                            errorMessage={null}
                            height={5}

                            handleChange={(value: string) => fld.onChange(value)}
                        />
                    default:
                        return <AInput
                            key={fld.code}
                            label={fld.label}
                            value={fld.value}
                            handleChange={(type: EV_BASE_CONTACT_ITEM_PROP, value: string) => { fld.onChange({ target: { value } } as LocalEventValueType) }}
                            errorMessage={null}
                            nameForHandler={fld.code}
                            handleOnFocus={(type: EV_BASE_CONTACT_ITEM_PROP, error: string) => { /* handle focus logic here */ }}
                        />
                }
            })}
        </div>
    )
}
