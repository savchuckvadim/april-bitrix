import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { bg } from '../../../../lib/intents';

type ToglerColor =
    | 'green'
    | 'blue'
    | 'bxblue'
    | 'dblue'
    | 'fiolet'
    | 'orange'
    | 'light'
    | 'dark'
    | 'april'
    | 'warning'
    | 'danger'
    | 'success';

const colorCodes = ['success', 'dblue', 'fiolet', 'warning', 'danger', 'dblue', 'success'] as ToglerColor[];
const badColorCodes = ['danger', 'orange', 'warning', 'blue', 'dblue', 'fiolet', 'success'] as ToglerColor[];

type ClickData = any;

interface ColorProps {
    title: string;
    value?: string;
    innerValue?: string;
    total: number;
    order: number;
    palit?: ToglerColor[];
    onClick: (data: ClickData | undefined) => void;
    onClickData?: ClickData;
    isBad?: boolean;
    size?: 'small' | 'medium' | 'large';
}

const ATogglerColor: FC<ColorProps> = ({
    value,
    innerValue,
    total,
    order,
    palit,
    isBad,
    size = 'small',
    onClick,
    onClickData,
}) => {
    const orderPercent = ((order + 1) / total) * 100;
    const targetColors = palit ? palit : isBad ? badColorCodes : colorCodes;
    const btnColor = targetColors[order] ?? 'april';

    const barHeight = size === 'small' ? 'h-3' : size === 'medium' ? 'h-3.5' : 'h-[17px]';

    return (
        <div
            className="flex w-full cursor-pointer flex-col justify-end p-0 text-[11px] font-bold text-muted-foreground"
            onClick={() => onClick(onClickData)}
        >
            {value && <p className="m-0 text-[11px] font-bold text-muted-foreground">{value}</p>}
            <div className={cn('w-full overflow-hidden rounded-full bg-muted', barHeight)}>
                <div
                    className={cn('flex h-full items-center justify-center text-[9px] text-white', bg(btnColor))}
                    style={{ width: `${orderPercent}%` }}
                >
                    {innerValue}
                </div>
            </div>
        </div>
    );
};

export default ATogglerColor;
export const getColorData = (total: number, order: number) => {
    const colors = ['red', 'yellow', 'green'];
    const randomNumber = Math.floor(Math.random() * 3) + 1;
    return {
        btnColor: colorCodes[order] as string,
        value: randomNumber * 35,
        nextColor: 'red',
    };
};
