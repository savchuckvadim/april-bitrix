import { FC } from 'react';
import { Page } from '@workspace/april-ui';
import { EventList } from '@/modules/widgets/EventList';

const EventListPage: FC = () => {
    return (
        <Page color="white">
            <EventList />
        </Page>
    );
};

export default EventListPage;
