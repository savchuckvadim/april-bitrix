'use client';

import { FC, useState } from 'react';
import { VenetianMask } from 'lucide-react';
import { IconAction, Spinner } from '@workspace/april-ui';
import { FieldCombobox } from '@workspace/april-ui/fields';
import { GlassDialog } from '@workspace/april-ui/surfaces';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { useImpersonation } from '../lib/hooks/use-impersonation';
import { IMPERSONATION_TEXT as TEXT } from '../lib/impersonation-texts';

interface ImpersonationButtonProps {
    /** После смены пользователя (обычно — на список дел). */
    onSwitched?: () => void;
}

/**
 * «Работать как сотрудник» в шапке — только суперпользователю April:
 * выбрать сотрудника отдела → приложение перезапускается от его имени.
 */
export const ImpersonationButton: FC<ImpersonationButtonProps> = ({
    onSwitched,
}) => {
    const [open, setOpen] = useState(false);
    const view = useImpersonation(onSwitched);
    if (!view.canStart) return null;

    const isWorking = view.status === 'working';

    const openDialog = () => {
        view.reset();
        setOpen(true);
    };

    const confirm = async () => {
        if (await view.start()) setOpen(false);
    };

    return (
        <>
            <IconAction
                icon={VenetianMask}
                label={TEXT.button}
                hint={TEXT.buttonHint}
                side="bottom"
                align="end"
                onClick={openDialog}
            />
            <GlassDialog
                open={open}
                onOpenChange={next => {
                    if (!isWorking) setOpen(next);
                }}
                size="sm"
                intensity="soft"
            >
                <DialogHeader>
                    <DialogTitle>{TEXT.title}</DialogTitle>
                    <DialogDescription>{TEXT.description}</DialogDescription>
                </DialogHeader>

                <FieldCombobox
                    id="impersonation-user"
                    label={TEXT.label}
                    options={view.candidates}
                    value={view.userId}
                    placeholder={TEXT.placeholder}
                    searchPlaceholder={TEXT.search}
                    emptyText={TEXT.empty}
                    onChange={view.setUserId}
                />

                {view.status === 'error' && (
                    <p className="text-sm text-destructive">{TEXT.failed}</p>
                )}

                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        disabled={isWorking}
                        onClick={() => setOpen(false)}
                    >
                        {TEXT.cancel}
                    </Button>
                    <Button
                        disabled={isWorking || !view.userId}
                        onClick={() => void confirm()}
                    >
                        {isWorking ? (
                            <>
                                <Spinner /> {TEXT.working}
                            </>
                        ) : (
                            TEXT.confirm
                        )}
                    </Button>
                </div>
            </GlassDialog>
        </>
    );
};
