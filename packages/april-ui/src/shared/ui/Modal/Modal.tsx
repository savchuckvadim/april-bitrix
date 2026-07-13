import { FC, ReactNode } from 'react';
import { Dialog, DialogContent } from '@workspace/ui/components/dialog';
import { cn } from '@workspace/ui/lib/utils';

interface ModalProps {
    color: 'white' | 'grey' | 'black';
    isActive?: boolean;
    children?: ReactNode;
    cancel: () => void;
    size?: 'small' | 'medium' | 'large' | 'lg' | 'md' | 'sm';
}

const SIZE_CLASSES: Record<string, string> = {
    small: 'sm:max-w-sm',
    sm: 'sm:max-w-sm',
    medium: 'sm:max-w-lg',
    md: 'sm:max-w-lg',
    large: 'sm:max-w-3xl',
    lg: 'sm:max-w-3xl',
};

const COLOR_CLASSES: Record<ModalProps['color'], string> = {
    white: 'bg-background text-foreground',
    grey: 'bg-muted text-foreground',
    black: 'bg-zinc-900 text-white',
};

const AModal: FC<ModalProps> = ({ color, isActive, size, cancel, children }) => {
    return (
        <Dialog open={!!isActive} onOpenChange={open => !open && cancel()}>
            <DialogContent
                className={cn('p-4', COLOR_CLASSES[color], SIZE_CLASSES[size || 'md'])}
            >
                {children}
            </DialogContent>
        </Dialog>
    );
};

export default AModal;
