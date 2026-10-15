import type { ReactNode } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@workspace/ui/components/alert';
import { cn } from '@workspace/ui/lib/utils';

interface HookNoticeProps {
    /** error — красный алерт; warning — кромка и иконка в тон warning; info — спокойно. */
    tone: 'error' | 'warning' | 'info';
    title?: string;
    message: ReactNode;
}

/** Уведомление раздела: ошибка запроса, ловушка хука или подсказка. */
export const HookNotice = ({ tone, title, message }: HookNoticeProps) => (
    <Alert
        variant={tone === 'error' ? 'destructive' : 'default'}
        className={cn(
            tone === 'warning' && 'border-warning/60 [&>svg]:text-warning',
        )}
    >
        {tone === 'info' ? (
            <Info className="size-4" />
        ) : (
            <AlertTriangle className="size-4" />
        )}
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{message}</AlertDescription>
    </Alert>
);
