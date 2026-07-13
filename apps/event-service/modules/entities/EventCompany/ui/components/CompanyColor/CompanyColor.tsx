import { useEffect, useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { bg } from '@workspace/april-ui';
import { CompanyColorType, getByColor } from '@/modules/entities/EventCompany/utils/event-company-util';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { setCurrentColor } from '@/modules/entities/EventCompany/model/EventCompanyThunk';

export const CompanyColor = () => {
    const dispatch = useAppDispatch();
    const color = useAppSelector(state => state.company.color.current?.code) as CompanyColorType;
    const [btnColor, setbtnColor] = useState(getByColor(color).btnColor);
    const [value, setvalue] = useState(getByColor(color).value);

    const setColor = () => {
        const nextColor = getByColor(color).nextColor;
        dispatch(setCurrentColor(nextColor));
    };

    useEffect(() => {
        setbtnColor(getByColor(color).btnColor);
        setvalue(getByColor(color).value);
    }, [color]);

    return (
        <div
            className="h-3 w-full cursor-pointer overflow-hidden rounded-full bg-muted"
            onClick={setColor}
            title="Прогноз"
        >
            <div
                className={cn('h-full transition-all', bg(btnColor))}
                style={{ width: `${value}%` }}
            />
        </div>
    );
};
