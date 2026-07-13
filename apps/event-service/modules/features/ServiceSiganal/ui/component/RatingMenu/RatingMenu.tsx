import { FC } from 'react';

const RatingMenu: FC<{ url: string }> = ({ url }) => {
    return (
        <div className="flex w-full flex-col items-start justify-start p-0">
            <iframe
                className="h-[600px] w-full rounded-lg border border-border"
                src={url}
                title="Отчет по Сервисному сигналу"
            />
        </div>
    );
};

export default RatingMenu;
