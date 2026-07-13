import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';

interface ALinkProps {
    title: string;
    redirect: () => void;
    isActive?: boolean;
}

const Link: FC<ALinkProps> = ({ title, isActive, redirect }) => {
    return (
        <p
            onClick={() => redirect()}
            className={cn(
                'm-0 cursor-pointer text-sm transition-colors hover:text-primary',
                isActive ? 'font-semibold text-primary' : 'text-foreground',
            )}
        >
            {title}
        </p>
    );
};

export default Link;
