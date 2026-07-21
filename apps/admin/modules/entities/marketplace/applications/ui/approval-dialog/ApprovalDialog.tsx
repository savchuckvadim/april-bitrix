'use client';

import * as React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { Loader2 } from 'lucide-react';

export type ModeratorAction = 'approve' | 'block' | 'detach';

interface ApprovalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    action: ModeratorAction;
    domain?: string;
    onConfirm: (comment?: string) => void;
    isLoading?: boolean;
}

/** Заголовок/описание/кнопка для каждого действия модератора */
const ACTION_VIEW: Record<
    ModeratorAction,
    {
        title: string;
        description: (domain: string) => string;
        confirmLabel: string;
        destructive: boolean;
    }
> = {
    approve: {
        title: 'Одобрить портал',
        description: (domain) =>
            `Портал ${domain} будет одобрен: активируется продукт sales и запустится установка сущностей.`,
        confirmLabel: 'Одобрить',
        destructive: false,
    },
    block: {
        title: 'Заблокировать портал',
        description: (domain) => `Портал ${domain} будет заблокирован.`,
        confirmLabel: 'Заблокировать',
        destructive: true,
    },
    detach: {
        title: 'Отвязать портал',
        description: (domain) =>
            `Портал ${domain} будет отвязан от организации: допуск вернётся в pending, продукты станут неактивными, приложение снова покажет экран ввода кода подключения. Подключение переживает переустановку приложения — отвязка единственный способ его снять без блокировки (смена владельца портала, отзыв доступа).`,
        confirmLabel: 'Отвязать',
        destructive: true,
    },
};

/** Диалог подтверждения решения модератора с необязательным комментарием. */
export function ApprovalDialog({
    open,
    onOpenChange,
    action,
    domain,
    onConfirm,
    isLoading = false,
}: ApprovalDialogProps) {
    const [comment, setComment] = React.useState('');

    React.useEffect(() => {
        if (open) setComment('');
    }, [open]);

    if (!open) return null;

    const view = ACTION_VIEW[action];

    const handleConfirm = () => {
        onConfirm(comment.trim() || undefined);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{view.title}</CardTitle>
                    <CardDescription>
                        {view.description(domain ?? '')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label htmlFor="approval-comment">
                        Комментарий модератора (необязательно)
                    </Label>
                    <Textarea
                        id="approval-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Комментарий попадёт в журнал событий"
                        rows={3}
                    />
                </CardContent>
                <CardFooter className="flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Отмена
                    </Button>
                    <Button
                        variant={view.destructive ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            view.confirmLabel
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
