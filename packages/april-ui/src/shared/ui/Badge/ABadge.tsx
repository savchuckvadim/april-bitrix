import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { soft, type LegacyColor } from '../../../lib/intents';
import IconeDoneSVG from '../components/IconeDoneSVG';

type Size = 'xsmall' | 'small' | 'medium' | 'big';

interface ABadgeProps {
    title: string;
    isActive?: boolean;
    color?: LegacyColor;
    size?: Size;
    clickHendler?: (clickHendlerData: any | null) => void;
    clickHendlerData?: { [key: string]: any };
    isIconeDone?: boolean;
    isIconePlace?: boolean;
}

const SIZE_CLASSES: Record<Size, string> = {
    xsmall: 'px-2 py-0.5 text-[11px]',
    small: 'px-2.5 py-0.5 text-xs',
    medium: 'px-3 py-1 text-sm',
    big: 'px-4 py-1.5 text-base',
};

const ABadge: FC<ABadgeProps> = ({
    title,
    isActive,
    color = 'april',
    size = 'medium',
    clickHendler,
    clickHendlerData,
    isIconeDone,
}) => {
    const iconSize = { xsmall: 18, small: 19, medium: 20, big: 30 }[size];

    return (
        <div
            onClick={() => clickHendler && clickHendler(clickHendlerData || null)}
            className={cn(
                'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
                soft(color),
                SIZE_CLASSES[size],
                !isActive && 'opacity-60',
                clickHendler && 'cursor-pointer',
            )}
        >
            <span>{size === 'xsmall' ? title.toLowerCase() : title.toUpperCase()}</span>
            {isIconeDone && isActive && size !== 'xsmall' && (
                <IconeDoneSVG width={iconSize} height={iconSize} />
            )}
        </div>
    );
};

export default ABadge;
