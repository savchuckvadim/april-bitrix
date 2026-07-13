import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';
import AIcon from '../../FuncIcon/FuncIcon';

interface EVCardProps {
    title: string;
    tooltipTitle?: ReactNode;
    width: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    size?: 'large' | 'big' | 'medium' | 'small' | 'full' | 'smallest' | 'fullest' | 'smallest-ss';
    children?: ReactNode;
    actionComponent?: ReactNode;
    withClose?: boolean;
    isClose?: boolean;
    closeAction?: () => void;
}

const SIZE_CLASSES: Record<NonNullable<EVCardProps['size']>, string> = {
    large: 'w-full',
    big: 'w-full',
    medium: 'w-full md:w-1/2',
    small: 'w-full md:w-1/3',
    smallest: 'w-full md:w-1/4',
    'smallest-ss': 'w-full md:w-1/5',
    full: 'w-full',
    fullest: 'w-full',
};

const EVCard: FC<EVCardProps> = ({
    title,
    tooltipTitle,
    size = 'small',
    children,
    actionComponent,
    withClose,
    isClose,
    closeAction,
}) => {
    const isDisactive = withClose && isClose;

    return (
        <div
            className={cn(
                'rounded-xl border border-border bg-card p-3 shadow-sm',
                SIZE_CLASSES[size],
                isDisactive && 'opacity-50',
            )}
        >
            <div className="flex items-center justify-between">
                {tooltipTitle ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <motion.h3
                                whileTap={{ scale: 0.99 }}
                                whileHover={{ scale: 1.02 }}
                                className="m-0 cursor-pointer p-0 text-sm font-semibold text-foreground"
                            >
                                {title}
                            </motion.h3>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[400px] text-start">
                            {tooltipTitle}
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <h3 className="m-0 p-0 text-sm font-semibold text-foreground">{title}</h3>
                )}

                <div className="flex items-center gap-1">
                    {!isDisactive && actionComponent}
                    {withClose && (
                        <AIcon type={isClose ? 'add' : 'cancel'} action={closeAction} />
                    )}
                </div>
            </div>

            {!isDisactive && <div className="mt-2">{children}</div>}
        </div>
    );
};

export default EVCard;
