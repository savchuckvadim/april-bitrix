'use client';

import { GlassDialog } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { useClientTypePrompt } from '../hooks/use-client-type-prompt';
import { ClientTypePromptOption } from './ClientTypePromptOption';

/**
 * Окно «Укажите тип клиента» поверх любого экрана: по типу клиента
 * подбираются реквизиты и шаблоны документов. Появляется, когда тип не задан
 * ни в компании, ни в сделке и не определился по реквизитам.
 */
export const ClientTypePromptDialog = () => {
    const prompt = useClientTypePrompt();
    const isSaving = prompt.pendingCode !== null;

    return (
        <GlassDialog
            open={prompt.open}
            onOpenChange={next => (next ? undefined : prompt.defer())}
            size="xs"
            intensity="soft"
            cardClassName="gap-4"
            showCloseButton={false}
        >
            <DialogHeader>
                <DialogTitle>Укажите тип клиента</DialogTitle>
                <DialogDescription>
                    Тип клиента запишется в компанию. От него зависят реквизиты
                    и шаблоны документов.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
                {prompt.options.map(option => (
                    <ClientTypePromptOption
                        key={option.code}
                        label={option.label}
                        pending={prompt.pendingCode === option.code}
                        disabled={isSaving}
                        onSelect={() => prompt.select(option.code)}
                    />
                ))}
            </div>
            {prompt.error ? (
                <p role="alert" className="text-sm text-destructive">
                    {prompt.error}
                </p>
            ) : null}
            <DialogFooter>
                <Button
                    type="button"
                    variant="ghost"
                    disabled={isSaving}
                    onClick={prompt.defer}
                >
                    Позже
                </Button>
            </DialogFooter>
        </GlassDialog>
    );
};
