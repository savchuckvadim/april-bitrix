import { FC } from 'react';

const EventCardAction: FC<{
    title: string;
    hendler: () => void;
}> = ({ title, hendler }) => {
    return (
        <p
            onClick={hendler}
            className="m-0 cursor-pointer p-0 text-sm font-medium text-primary hover:underline"
        >
            {title}
        </p>
    );
};

export default EventCardAction;
