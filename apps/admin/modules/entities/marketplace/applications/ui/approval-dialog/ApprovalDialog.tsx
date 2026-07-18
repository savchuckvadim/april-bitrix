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

interface ApprovalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    action: 'approve' | 'block';
    domain?: string;
    onConfirm: (comment?: string) => void;
    isLoading?: boolean;
}

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

    const isApprove = action === 'approve';

    const handleConfirm = () => {
        onConfirm(comment.trim() || undefined);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>
                        {isApprove ? 'Одобрить портал' : 'Заблокировать портал'}
                    </CardTitle>
                    <CardDescription>
                        {isApprove
                            ? `Портал ${domain ?? ''} будет одобрен: активируется продукт sales и запустится установка сущностей.`
                            : `Портал ${domain ?? ''} будет заблокирован.`}
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
                        variant={isApprove ? 'default' : 'destructive'}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isApprove ? (
                            'Одобрить'
                        ) : (
                            'Заблокировать'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
