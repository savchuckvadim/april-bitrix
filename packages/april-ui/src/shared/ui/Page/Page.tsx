import { FC, ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';

interface PageProps {
    color: 'white' | 'grey';
    children?: ReactNode;
}

const Page: FC<PageProps> = ({ color, children }) => {
    return (
        <div
            className={cn(
                'min-h-screen w-full p-0',
                color === 'grey' ? 'bg-muted' : 'bg-background',
            )}
        >
            {children}
        </div>
    );
};

export default Page;
