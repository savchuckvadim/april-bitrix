'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { getApiErrorMessage } from '../../../../../lib/api-error';
import { useInstallAicall } from '../../../lib/hooks';
import type { InstallAicallResult } from '../../../model';

/** Строка сводки по полям: счётчик + список UF-имён. */
function FieldsSummaryLine({
    label,
    fields,
    tone,
}: {
    label: string;
    fields: string[];
    tone?: 'destructive';
}) {
    return (
        <div className={tone === 'destructive' ? 'text-destructive' : undefined}>
            {label}: {fields.length}
            {fields.length > 0 && (
                <div className="break-all font-mono text-xs">
                    {fields.join(', ')}
                </div>
            )}
        </div>
    );
}

/** Итог установки: создан ли тип и судьба каждого поля. Экспортирован для
 * реюза в `ConstInstallDialog` галереи (контракт результата тот же). */
export function InstallResultView({ result }: { result: InstallAicallResult }) {
    return (
        <div className="space-y-2 rounded-md border p-3 text-sm">
            <p className="font-medium">
                {result.created
                    ? `Тип создан (entityTypeId: ${result.entityTypeId})`
                    : `Тип уже существовал (entityTypeId: ${result.entityTypeId})`}
            </p>
            <FieldsSummaryLine
                label="Полей добавлено"
                fields={result.fieldsAdded}
            />
            <FieldsSummaryLine
                label="Полей уже существовало"
                fields={result.fieldsExisting}
            />
            <FieldsSummaryLine
                label="Полей не удалось создать"
                fields={result.fieldsFailed}
                tone="destructive"
            />
        </div>
    );
}

/**
 * Диалог установки смарта «AI-анализ звонков»: подтверждение с доменом портала
 * (или ручным вводом, если у портала домен не задан), лоадер на время
 * установки (до 2 минут) и итог по полям. Установка идемпотентна; после
 * успеха список смартов инвалидируется (в хуке).
 */
export function InstallAicallDialog({
    open,
    onOpenChange,
    portalDomain,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Домен портала со страницы; если недоступен — показывается поле ввода. */
    portalDomain?: string;
}) {
    const install = useInstallAicall();
    const { reset } = install;
    const [manualDomain, setManualDomain] = React.useState('');
    const domain = (portalDomain ?? manualDomain).trim();

    React.useEffect(() => {
        if (open) {
            setManualDomain('');
            reset();
        }
    }, [open, reset]);

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => !install.isPending && onOpenChange(o)}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        Установить смарт «AI-анализ звонков»
                    </DialogTitle>
                    <DialogDescription>
                        Идемпотентная установка: тип создаётся при отсутствии,
                        затем доливаются недостающие поля. Повторный запуск
                        безопасен и не плодит дубликаты.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    {portalDomain ? (
                        <p className="text-sm">
                            Портал:{' '}
                            <span className="font-mono">{portalDomain}</span>
                        </p>
                    ) : (
                        <div className="space-y-1">
                            <Label htmlFor="aicall-domain">
                                Домен портала (у портала не задан domain)
                            </Label>
                            <Input
                                id="aicall-domain"
                                value={manualDomain}
                                onChange={(e) =>
                                    setManualDomain(e.target.value)
                                }
                                placeholder="example.bitrix24.ru"
                                disabled={install.isPending}
                            />
                        </div>
                    )}

                    {install.isPending && (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Установка идёт — может занять до 2 минут, не
                            закрывайте окно…
                        </p>
                    )}
                    {install.isError && (
                        <p className="text-sm text-destructive">
                            {getApiErrorMessage(
                                install.error,
                                'Установка не удалась',
                            )}
                        </p>
                    )}
                    {install.data && (
                        <InstallResultView result={install.data} />
                    )}
                </div>

                <DialogFooter>
                    {install.data ? (
                        <Button onClick={() => onOpenChange(false)}>
                            Закрыть
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                disabled={install.isPending}
                                onClick={() => onOpenChange(false)}
                            >
                                Отмена
                            </Button>
                            <Button
                                disabled={install.isPending || !domain}
                                onClick={() => install.mutate(domain)}
                            >
                                {install.isPending
                                    ? 'Установка…'
                                    : 'Установить'}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
