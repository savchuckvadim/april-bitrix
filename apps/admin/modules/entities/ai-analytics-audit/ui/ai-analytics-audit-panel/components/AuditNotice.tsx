import type { ReactNode } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@workspace/ui/components/alert';
import { cn } from '@workspace/ui/lib/utils';

interface AuditNoticeProps {
    /**
     * error — красный алерт (403, сбой запроса); warning — портал не готов
     * (кромка и иконка в тон warning); info — спокойное сообщение.
     */
    tone: 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    /** Действие под текстом: ссылка на настройки, кнопка. */
    action?: ReactNode;
}

/** Уведомление под формой: ошибка, «портал не готов» или «снапшотов ещё нет». */
export const AuditNotice = ({ tone, title, message, action }: AuditNoticeProps) => (
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
        <AlertDescription>
            <p>{message}</p>
            {action && <div className="mt-2">{action}</div>}
        </AlertDescription>
    </Alert>
);
