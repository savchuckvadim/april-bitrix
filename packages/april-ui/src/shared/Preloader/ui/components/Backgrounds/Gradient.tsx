import { FC, useEffect, useRef } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import Logo from '../../../../ui/Logo/Logo';

interface GradientProps {
    isResized?: boolean;
    isActive?: boolean;
    isComponent?: boolean;
    isNeedScroll?: boolean;
    white?: boolean;
    phrase: string;
}

export const Gradient: FC<GradientProps> = ({
    isResized,
    isActive,
    isComponent,
    isNeedScroll,
    white = false,
    phrase,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isComponent && isNeedScroll) {
            if (!isResized) {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
            const timer = setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 400);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <div
            ref={scrollRef}
            className={cn(
                'flex items-center justify-center rounded-xl',
                white ? 'bg-background' : 'bg-muted',
                isComponent ? 'min-h-[120px] p-6' : 'min-h-screen p-10',
            )}
        >
            <div className="flex flex-col items-center gap-3">
                <div className="animate-pulse">
                    <Logo />
                </div>
                {isActive && <p className="text-sm text-muted-foreground">{phrase}</p>}
            </div>
        </div>
    );
};

export default Gradient;
