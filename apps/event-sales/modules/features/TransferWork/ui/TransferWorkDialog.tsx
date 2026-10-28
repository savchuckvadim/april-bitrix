'use client';

import { FC } from 'react';
import { Spinner } from '@workspace/april-ui';
import { FieldCombobox } from '@workspace/april-ui/fields';
import { GlassDialog } from '@workspace/april-ui/surfaces';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import type { useTransferWork } from '../lib/hooks/use-transfer-work';

interface TransferWorkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    view: ReturnType<typeof useTransferWork>;
}

/**
 * Окно «Передать работу»: кому → «Передать» → итог и «Обновить приложение»
 * (после передачи данные клиента в окне устарели).
 */
export const TransferWorkDialog: FC<TransferWorkDialogProps> = ({
    open,
    onOpenChange,
    view,
}) => {
    const { text, status } = view;
    const isWorking = status === 'working';

    return (
        <GlassDialog
            open={open}
            onOpenChange={next => {
                // Пока операция идёт — окно не закрываем: итог важен.
                if (!isWorking) onOpenChange(next);
            }}
            size="sm"
            intensity="soft"
            cardClassName="gap-4"
        >
            <DialogHeader>
                <DialogTitle>{text.title}</DialogTitle>
                <DialogDescription>{text.description}</DialogDescription>
            </DialogHeader>

            {status === 'done' ? (
                <div className="space-y-2 rounded-md border border-success/40 bg-success/5 p-2">
                    <p className="text-sm font-semibold text-foreground">
                        {text.done(view.chosenName)}
                    </p>
                    {view.warnings.length > 0 && (
                        <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                            {view.warnings.map(warning => (
                                <li key={warning}>{warning}</li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <FieldCombobox
                    id="transfer-work-user"
                    label={text.label}
                    options={view.candidates}
                    value={view.userId}
                    placeholder={text.placeholder}
                    searchPlaceholder={text.search}
                    emptyText={text.empty}
                    onChange={view.setUserId}
                />
            )}

            {status === 'error' && (
                <p className="text-sm text-destructive">{text.failed}</p>
            )}

            <div className="flex justify-end gap-2">
                {status === 'done' ? (
                    <>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            {text.close}
                        </Button>
                        <Button onClick={view.reload}>{text.reload}</Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            disabled={isWorking}
                            onClick={() => onOpenChange(false)}
                        >
                            {text.cancel}
                        </Button>
                        <Button
                            disabled={isWorking || !view.userId}
                            onClick={() => void view.transfer()}
                        >
                            {isWorking ? (
                                <>
                                    <Spinner /> {text.working}
                                </>
                            ) : (
                                text.confirm
                            )}
                        </Button>
                    </>
                )}
            </div>
        </GlassDialog>
    );
};
