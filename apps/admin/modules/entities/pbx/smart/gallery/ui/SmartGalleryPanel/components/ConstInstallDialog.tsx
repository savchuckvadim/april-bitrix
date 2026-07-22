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
import { InstallResultView } from '../../../../db/ui/DbSmartsPanel/components/InstallAicallDialog';
import { useInstallConstSmart } from '../../../lib/hooks';

/**
 * Обобщение `InstallAicallDialog` для любого const-смарта из реестра:
 * подтверждение с доменом портала (или ручным вводом, если у портала домен
 * не задан), лоадер на время установки (до 2 минут) и итог по полям
 * (added/existing/failed, failed — красным). Установка идемпотентна; после
 * успеха списки смартов и мониторинг инвалидируются (в хуке).
 */
export function ConstInstallDialog({
    open,
    onOpenChange,
    kind,
    title,
    portalDomain,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** `kind` const-смарта из реестра — уходит в `POST install-const`. */
    kind: string;
    /** Русское название смарта для заголовка диалога. */
    title: string;
    /** Домен портала со страницы; если недоступен — показывается поле ввода. */
    portalDomain?: string;
}) {
    const install = useInstallConstSmart();
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
                    <DialogTitle>Установить смарт «{title}»</DialogTitle>
                    <DialogDescription>
                        Идемпотентная установка из констант: тип создаётся при
                        отсутствии, затем доливаются недостающие поля.
                        Повторный запуск безопасен и не плодит дубликаты.
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
                            <Label htmlFor={`const-domain-${kind}`}>
                                Домен портала (у портала не задан domain)
                            </Label>
                            <Input
                                id={`const-domain-${kind}`}
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
                                onClick={() =>
                                    install.mutate({ kind, domain })
                                }
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
