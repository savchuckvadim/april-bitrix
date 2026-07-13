import { FC, ReactElement, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { solid, type LegacyColor } from '../../../lib/intents';
import IconeDoneSVG from '../components/IconeDoneSVG';

export type ComponentPropsColors = LegacyColor;

interface AButtonProps {
    title: string;
    isActive?: boolean;
    align?: 'center' | 'left' | 'right';
    color?: ComponentPropsColors;
    size?: 'xsmall' | 'small' | 'medium' | 'xmedium' | 'big';
    clickHendler?: (clickHendlerData: any | null) => void;
    clickHendlerData?: { [key: string]: any };
    isIconeDone?: boolean;
    children?: ReactNode | ReactElement;
}

const SIZE_CLASSES = {
    xsmall: 'h-7 px-2 text-xs',
    small: 'h-8 px-3 text-sm',
    medium: 'h-9 px-4 text-sm',
    xmedium: 'h-10 px-5 text-base',
    big: 'h-11 px-6 text-base',
};

const ALIGN_CLASSES = {
    center: 'justify-center text-center',
    left: 'justify-start text-left',
    right: 'justify-end text-right',
};

const AButton: FC<AButtonProps> = ({
    title,
    isActive = true,
    align = 'center',
    color = 'april',
    size = 'medium',
    clickHendler,
    clickHendlerData,
    isIconeDone,
    children,
}) => {
    return (
        <motion.div whileTap={{ scale: 0.9 }}>
            <Button
                type="button"
                disabled={!isActive}
                onClick={() => clickHendler && clickHendler(clickHendlerData || null)}
                className={cn(
                    'inline-flex w-full items-center gap-2 rounded-md font-medium transition-colors',
                    solid(color),
                    SIZE_CLASSES[size],
                    ALIGN_CLASSES[align],
                    !isActive && 'opacity-50',
                    clickHendler ? 'cursor-pointer' : 'cursor-not-allowed',
                )}
            >
                {title.toLowerCase()}
                {isIconeDone && <IconeDoneSVG width={20} height={20} />}
                {children}
            </Button>
        </motion.div>
    );
};

export default AButton;
