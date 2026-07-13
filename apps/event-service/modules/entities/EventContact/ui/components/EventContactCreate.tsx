import { eventContactActions } from "../../model/EventContactSlice";
import { FC } from "react";
import { EV_CONTACT_PROP, EV_CONTACT_TYPE } from "../../type/event-contact-type";
import { saveCreatedContact } from "../../model/EventContactThunk";
import { useAppDispatch, useAppSelector } from "@/modules/app/lib/hooks/redux";
import { AButton, AInput, EVCard, PreloaderCard, AModal } from '@workspace/april-ui';

interface EventContactCreateProps {
    type: EV_CONTACT_TYPE
    isActive?: boolean

}

export const EventContactCreate: FC<EventContactCreateProps> = ({ type, isActive }) => {

    const dispatch = useAppDispatch()
    const save = () => dispatch(
        saveCreatedContact(
            type
        )
    )

    const cancel = () => dispatch(
        eventContactActions
            .setCreatingContact({
                isCreating: false,
                type: null
            })
    )
    const contactPropChange = (type: EV_CONTACT_PROP, value: string) => dispatch(
        eventContactActions
            .setContactProp({
                type,
                value
            })
    )


    const errors = useAppSelector(state => state.event.errors.current)

    const contactTypeString = type === "plan" ? 'с кем планируются переговоры' : 'с кем велись переговоры'

    const isFetching = useAppSelector(state => state.contact.creating.isFetched)
    return (
        <AModal
            // type={type}
            isActive={isActive}
            color='grey'
            cancel={cancel}
        >
            {!isFetching ? <EVCard title={`Создание контакта - ${contactTypeString}`}
                width={2}
                size={"small"}


            >


                <AInput
                    label={'ФИО контактного лица'}
                    errorMessage={errors[EV_CONTACT_PROP.NAME]}
                    nameForHandler={EV_CONTACT_PROP.NAME}
                    handleChange={contactPropChange}
                    handleOnFocus={contactPropChange}
                />
                <AInput
                    label={'Должность контактного лица'}
                    // errorMessage={errors[EV_PLAN_PROP.CONTACT_EMAIL]}
                    errorMessage={''}

                    nameForHandler={EV_CONTACT_PROP.POST}
                    handleChange={contactPropChange}
                    handleOnFocus={contactPropChange}
                />
                <AInput
                    label={'Телефон контактного лица'}
                    // errorMessage={errors[EV_PLAN_PROP.CONTACT_PHONE]}            
                    errorMessage={errors[EV_CONTACT_PROP.PHONE]}

                    nameForHandler={EV_CONTACT_PROP.PHONE}
                    handleChange={contactPropChange}
                    handleOnFocus={contactPropChange}
                />
                <AInput
                    label={'E-mail контактного лица'}
                    // errorMessage={errors[EV_PLAN_PROP.CONTACT_EMAIL]}
                    errorMessage={errors[EV_CONTACT_PROP.EMAIL]}

                    nameForHandler={EV_CONTACT_PROP.EMAIL}
                    handleChange={contactPropChange}
                    handleOnFocus={contactPropChange}
                />
                <div className="mt-3 flex items-center justify-end gap-2">
                    <AButton
                        title='сохранить'
                        align='center'
                        color='blue'
                        size='medium'
                        clickHendler={save}
                    />
                    <AButton
                        title='отмена'
                        align='center'
                        color='grey'
                        size='medium'
                        clickHendler={cancel}
                    />
                </div>



                {/* </Col> */}
            </EVCard>

                : <PreloaderCard/>

            }
        </AModal>
    );
}