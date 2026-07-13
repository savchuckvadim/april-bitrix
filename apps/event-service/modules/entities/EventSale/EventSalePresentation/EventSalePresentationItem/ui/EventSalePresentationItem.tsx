import { ADate } from "@workspace/april-ui";
import { AInput } from "@workspace/april-ui";
import { AText } from "@workspace/april-ui";
import { FC } from 'react';






const EventSalePresentationItem: FC = ({ }) => {
    return (<>

        {/* @ts-ignore */}
        <AText
            label={'Опишите кратко что было'}
            height={7}
        // handleChange={handleChange}
        // nameForHandler={EV_REPORT_PROP.COMMENT}
        />
        {/* @ts-ignore */}
        <AInput
            label={'Название - что нужно сделать'}
        // errorMessage={nameErrorMessge}
        // nameForHandler={EV_PLAN_PROP.NAME}
        // handleChange={planPropChange}
        // handleOnFocus={handleOnNameFocus}
        />
        {/* @ts-ignore */}
        <ADate
            label={'Дата и время звонка'}
            value={'date'}
        // errorMessage={null}
        // nameForHandler={EV_PLAN_PROP.DATE}
        // handleChange={planPropChange}
        // handleOnFocus={false}
        />

    </>
    );
}

export default EventSalePresentationItem;