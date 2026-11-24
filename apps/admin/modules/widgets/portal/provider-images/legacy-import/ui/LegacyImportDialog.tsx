'use client';

import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { PROVIDER_IMAGE_LEGACY_TEXT } from '@/modules/entities/portal-provider/provider-image';
import { useLegacyImport } from '../hooks/use-legacy-import';
import { LegacyImportFolderPicker } from './LegacyImportFolderPicker';
import { LegacyImportReport } from './LegacyImportReport';

interface LegacyImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const TEXT = PROVIDER_IMAGE_LEGACY_TEXT;

/**
 * Диалог переноса картинок из легаси: выбор папки, «Проверить» (ничего не
 * пишет) и «Перенести». Переносятся картинки всех порталов из выбранной папки.
 */
export function LegacyImportDialog({ open, onOpenChange }: LegacyImportDialogProps) {
    const flow = useLegacyImport(onOpenChange);
    const { selection } = flow;

    return (
        <Dialog open={open} onOpenChange={flow.changeOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>{TEXT.title}</DialogTitle>
                    <DialogDescription>{TEXT.description}</DialogDescription>
                </DialogHeader>

                <div className="flex flex-wrap items-center gap-3">
                    <LegacyImportFolderPicker
                        hasSelection={selection !== null}
                        disabled={flow.isSending}
                        onPick={flow.pickFiles}
                    />
                    <div className="space-y-0.5 text-sm">
                        {selection === null ? (
                            <p className="text-muted-foreground">{TEXT.noFolder}</p>
                        ) : (
                            <>
                                <p>{TEXT.pickedFiles(selection.folder, selection.files.length)}</p>
                                {selection.skipped > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        {TEXT.skippedFiles(selection.skipped)}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {flow.selectionError && (
                    <Alert variant="destructive">
                        <AlertDescription>{flow.selectionError}</AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" disabled={!flow.canCheck} onClick={flow.check}>
                        {flow.sendingDryRun === true ? TEXT.checking : TEXT.check}
                    </Button>
                    <Button disabled={!flow.canRun} onClick={flow.run}>
                        {flow.sendingDryRun === false ? TEXT.running : TEXT.run}
                    </Button>
                    {selection !== null && !flow.canRun && !flow.isSending && (
                        <p className="text-xs text-muted-foreground">{TEXT.runNeedsCheck}</p>
                    )}
                </div>

                {flow.errorMessage && (
                    <Alert variant="destructive">
                        <AlertDescription>{flow.errorMessage}</AlertDescription>
                    </Alert>
                )}

                {flow.report && <LegacyImportReport report={flow.report} />}

                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={flow.isSending}
                        onClick={() => flow.changeOpen(false)}
                    >
                        {TEXT.close}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
