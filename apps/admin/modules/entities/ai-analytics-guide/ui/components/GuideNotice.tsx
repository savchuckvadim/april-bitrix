import type { ReactNode } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@workspace/ui/components/alert';
import { cn } from '@workspace/ui/lib/utils';

interface GuideNoticeProps {
    /** error — красный алерт; warning — кромка в тон warning; info — спокойно. */
    tone: 'error' | 'warning' | 'info';
    title?: string;
    message: ReactNode;
}

/** Уведомление путеводителя: ошибка запроса, подсказка, предупреждение. */
export const GuideNotice = ({ tone, title, message }: GuideNoticeProps) => (
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
