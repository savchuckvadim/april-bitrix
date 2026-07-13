import { FC } from 'react';
import { PlusCircle, CheckCircle2, XCircle, Trash2, Pencil } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

export interface AIconProps {
    type: 'add' | 'cancel' | 'done' | 'delete' | 'update';
    actionProps?: any;
    action: (actionProps: any) => void;
}

const ICONS = {
    add: PlusCircle,
    done: CheckCircle2,
    cancel: XCircle,
    delete: Trash2,
    update: Pencil,
};

const AIcon: FC<AIconProps> = ({ type, action }) => {
    const Icon = ICONS[type] ?? PlusCircle;
    return (
        <Icon
            onClick={action}
            className={cn('h-5 w-5 cursor-pointer text-muted-foreground transition-colors hover:text-foreground')}
        />
    );
};

export default AIcon;
