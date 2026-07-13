import { FC } from 'react';
import { Page } from '@workspace/april-ui';
import { EventItem } from '@/modules/widgets/EventItem';

const EventItemPage: FC = () => {
    return (
        <Page color="grey">
            <div className="w-full p-2">
                <EventItem />
            </div>
        </Page>
    );
};

export default EventItemPage;
