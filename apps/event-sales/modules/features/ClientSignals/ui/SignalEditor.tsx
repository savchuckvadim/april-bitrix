'use client';

import { FC, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { MicroSpinner, TIMER_GRADIENT_BRIGHT } from '@workspace/april-ui';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { clientSignalsActions } from '../model/ClientSignalsSlice';
import { saveSignal } from '../model/ClientSignalsThunk';

/**
 * Микро-редактор точки связи лида: одно поле под открытый вид сигнала
 * (телефон или email). Паттерн InnEditor: пессимистичная запись, спиннер
 * на кнопке, ошибка гаснет при правке ввода.
 */
export const SignalEditor: FC = () => {
    const dispatch = useAppDispatch();
    const editor = useAppSelector(s => s.clientSignals.editor);
    const isSaving = useAppSelector(s => s.clientSignals.isSaving);
    const error = useAppSelector(s => s.clientSignals.error);
    const [draft, setDraft] = useState('');

    if (!editor) return null;

    const isPhone = editor === 'phone';

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
                {isPhone ? 'Телефон лида' : 'Email лида'}
            </span>
            <Input
                value={draft}
                onChange={event => {
                    setDraft(event.target.value);
                    if (error) dispatch(clientSignalsActions.clearError());
                }}
                placeholder={isPhone ? '+7 999 123-45-67' : 'name@domain.ru'}
                inputMode={isPhone ? 'tel' : 'email'}
                disabled={isSaving}
                className="h-7 w-44 text-sm"
                aria-label={isPhone ? 'Телефон лида' : 'Email лида'}
            />
            <Button
                size="sm"
                className="h-7 gap-1.5 px-2"
                disabled={isSaving || !draft.trim()}
                onClick={() => dispatch(saveSignal(editor, draft))}
            >
                {isSaving ? (
                    <MicroSpinner size={13} gradient={TIMER_GRADIENT_BRIGHT} />
                ) : (
                    <Check aria-hidden className="size-3.5" />
                )}
                Сохранить
            </Button>
            <Button
                size="sm"
                variant="ghost"
                className="h-7 px-1.5 text-muted-foreground"
                disabled={isSaving}
                aria-label="Закрыть редактор"
                onClick={() =>
                    dispatch(clientSignalsActions.setEditor({ kind: null }))
                }
            >
                <X aria-hidden className="size-3.5" />
            </Button>
            {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
    );
};
