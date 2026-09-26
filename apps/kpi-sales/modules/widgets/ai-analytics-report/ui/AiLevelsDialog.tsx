'use client';

import { Button } from '@workspace/ui/components/button';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { GlassDialog } from '@workspace/april-ui';
import { AI_SETTINGS_BLOCK_LABELS } from '@/modules/entities/ai-analytics';
import {
    useAiSettingsForm,
    type AiSettingsForm,
} from '../hooks/use-ai-settings-form';
import type { AiSettingsTab } from '../lib/ai-settings-form.util';
import { AiSettingsTabs } from './components/AiSettingsTabs';
import { AiSettingsConfirm } from './components/AiSettingsConfirm';
import { AiSettingsSummary } from './components/AiSettingsSummary';

interface AiLevelsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Вкладка при открытии; по умолчанию «Уровни». */
    initialTab?: AiSettingsTab;
}

/** Подпись состояния формы в подвале: ошибка бэка, что уйдёт, read-only. */
const footerNote = (form: AiSettingsForm): string | null => {
    if (form.readOnly) {
        return 'Менять настройки могут только руководители отдела продаж.';
    }
    if (form.payloadBlocks.length === 0) return 'Изменений нет.';
    return `Будет сохранено: ${form.payloadBlocks
        .map(block => AI_SETTINGS_BLOCK_LABELS[block].toLowerCase())
        .join(', ')}.`;
};

/**
 * Настройки витрины (AI_CONFIGURE, руководители op/cup): уровни менеджеров
 * из обзора, цели по уровням, отсутствия, подтверждение состава →
 * settings/save только изменёнными блоками. Блоки, рвущие сравнимую
 * историю, требуют подтверждения; после ответа бэка — сводка
 * (comparableFrom, коды, предупреждения). Обзор перечитывает listener.
 */
export const AiLevelsDialog = ({
    open,
    onOpenChange,
    initialTab = 'levels',
}: AiLevelsDialogProps) => {
    const form = useAiSettingsForm(open, initialTab);
    const close = () => onOpenChange(false);

    return (
        <GlassDialog
            open={open}
            onOpenChange={onOpenChange}
            size="md"
            intensity="soft"
            cardClassName="max-h-[85vh] gap-4 overflow-hidden"
        >
            <DialogHeader>
                <DialogTitle>Настройки витрины</DialogTitle>
                <DialogDescription>
                    Уровни менеджеров, цели по уровням, отсутствия и
                    подтверждение состава. Сохраняются только изменённые блоки;
                    после сохранения обзор пересчитывается.
                </DialogDescription>
            </DialogHeader>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                {form.step === 'done' && form.summary ? (
                    <AiSettingsSummary summary={form.summary} />
                ) : form.step === 'confirm' ? (
                    <AiSettingsConfirm blocks={form.breakingBlocks} />
                ) : (
                    <AiSettingsTabs form={form} />
                )}
            </div>
            <DialogFooter className="items-center gap-2">
                {form.error && form.step !== 'done' && (
                    <p className="mr-auto text-xs text-destructive">
                        {form.error}
                    </p>
                )}
                {form.step === 'edit' && (
                    <>
                        {!form.error && (
                            <p className="mr-auto text-xs text-muted-foreground">
                                {footerNote(form)}
                            </p>
                        )}
                        <Button variant="outline" size="sm" onClick={close}>
                            Отмена
                        </Button>
                        <Button
                            size="sm"
                            disabled={!form.canSave}
                            onClick={form.submit}
                        >
                            {form.saving ? 'Сохраняем…' : 'Сохранить'}
                        </Button>
                    </>
                )}
                {form.step === 'confirm' && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={form.saving}
                            onClick={form.backToEdit}
                        >
                            Назад
                        </Button>
                        <Button
                            size="sm"
                            disabled={form.saving}
                            onClick={form.submit}
                        >
                            {form.saving ? 'Сохраняем…' : 'Продолжить'}
                        </Button>
                    </>
                )}
                {form.step === 'done' && (
                    <Button size="sm" onClick={close}>
                        Закрыть
                    </Button>
                )}
            </DialogFooter>
        </GlassDialog>
    );
};
