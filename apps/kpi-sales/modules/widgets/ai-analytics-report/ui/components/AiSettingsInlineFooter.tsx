'use client';

import { Button } from '@workspace/ui/components/button';
import { AI_SETTINGS_BLOCK_LABELS } from '@/modules/entities/ai-analytics';
import type { AiSettingsForm } from '../../hooks/use-ai-settings-form';
import { AI_SETTINGS_INLINE_TEXT } from '../../lib/ai-settings-sections.texts';

interface AiSettingsInlineFooterProps {
    form: AiSettingsForm;
    /** После сводки — начать новую правку (форма собирается заново). */
    onReset: () => void;
}

const T = AI_SETTINGS_INLINE_TEXT.footer;

/** Подпись состояния формы: только чтение, нет изменений, что уйдёт. */
export const aiSettingsFooterNote = (
    form: Pick<AiSettingsForm, 'readOnly' | 'payloadBlocks'>,
): string => {
    if (form.readOnly) return T.readOnly;
    if (form.payloadBlocks.length === 0) return T.noChanges;
    return T.willSave(
        form.payloadBlocks.map(block =>
            AI_SETTINGS_BLOCK_LABELS[block].toLowerCase(),
        ),
    );
};

/**
 * Подвал раскрытых секций настроек: правка — подпись и «Сохранить»;
 * подтверждение сдвига истории — «Назад» и «Продолжить»; после сводки —
 * «Продолжить правку». Ошибка бэка — слева красным.
 */
export const AiSettingsInlineFooter = ({ form, onReset }: AiSettingsInlineFooterProps) => (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-3">
        {form.error && form.step !== 'done' ? (
            <p className="mr-auto text-xs text-destructive">{form.error}</p>
        ) : (
            form.step === 'edit' && (
                <p className="mr-auto text-xs text-muted-foreground">
                    {aiSettingsFooterNote(form)}
                </p>
            )
        )}
        {form.step === 'edit' && (
            <Button size="sm" disabled={!form.canSave} onClick={form.submit}>
                {form.saving ? T.saving : T.save}
            </Button>
        )}
        {form.step === 'confirm' && (
            <>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={form.saving}
                    onClick={form.backToEdit}
                >
                    {T.back}
                </Button>
                <Button size="sm" disabled={form.saving} onClick={form.submit}>
                    {form.saving ? T.saving : T.proceed}
                </Button>
            </>
        )}
        {form.step === 'done' && (
            <Button variant="outline" size="sm" onClick={onReset}>
                {T.continueEditing}
            </Button>
        )}
    </div>
);
