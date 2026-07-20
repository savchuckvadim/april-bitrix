'use client';

import * as React from 'react';
import { IssuedInviteDto } from '@workspace/nest-admin-api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { AlertTriangle, Check, Copy } from 'lucide-react';
import { formatDateTime } from '../../../shared';

interface IssuedCodeDialogProps {
    invite: IssuedInviteDto | null;
    onClose: () => void;
}

/**
 * Показ выпущенного кода — ЕДИНСТВЕННЫЙ момент, когда код виден: в БД
 * хранится только его хэш, повторно отправить тот же код невозможно
 * (можно лишь перевыпустить новый). Поэтому диалог настойчиво предлагает
 * скопировать код, а при неудачной отправке письма прямо об этом говорит.
 */
export function IssuedCodeDialog({ invite, onClose }: IssuedCodeDialogProps) {
    const [copied, setCopied] = React.useState(false);

    // Сброс отметки «скопировано» при показе следующего кода
    React.useEffect(() => {
        setCopied(false);
    }, [invite?.id]);

    const copy = async () => {
        if (!invite) return;
        try {
            await navigator.clipboard.writeText(invite.code);
            setCopied(true);
        } catch {
            setCopied(false); // буфер недоступен — код и так виден на экране
        }
    };

    return (
        <Dialog
            open={invite !== null}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Код подключения выпущен</DialogTitle>
                    <DialogDescription>
                        {invite?.emailSent
                            ? `Письмо с кодом отправлено на ${invite.email}.`
                            : 'Письмо отправить не удалось — передайте код клиенту вручную.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <code className="flex-1 rounded-md bg-muted px-3 py-2 text-center font-mono text-lg tracking-widest">
                            {invite?.code}
                        </code>
                        <Button
                            variant="outline"
                            size="icon"
                            title="Скопировать код"
                            onClick={() => void copy()}
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {!invite?.emailSent && (
                        <p className="flex items-start gap-2 text-sm text-red-600">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            Письмо не ушло (проблема с почтовым сервером). Код
                            действителен — скопируйте его и отправьте клиенту
                            сами, либо перевыпустите позже.
                        </p>
                    )}

                    <p className="text-sm text-muted-foreground">
                        Код показывается один раз: в базе хранится только его
                        хэш. Если код потеряется, придётся выпустить новый.
                        {invite?.expiresAt
                            ? ` Действует до ${formatDateTime(invite.expiresAt)}.`
                            : ''}
                    </p>
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Готово</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
