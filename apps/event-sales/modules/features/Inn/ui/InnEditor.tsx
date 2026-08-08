'use client';

import { FC, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { MicroSpinner, TIMER_GRADIENT_BRIGHT } from '@workspace/april-ui';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getCurrentInn, getInnTarget } from '../lib/inn-selectors';
import { innActions } from '../model/InnSlice';
import { saveInn } from '../model/InnThunk';

/**
 * Микро-редактор ИНН в шапке отчёта. Открывается действием «Заполнить/
 * Записать» из предупреждений; сам гейтится по isEditorOpen и наличию
 * pbx-поля на портале. Кнопка сохранения показывает MicroSpinner на время
 * записи (пессимистичный паттерн — стейт меняется после ответа Битрикса).
 */
export const InnEditor: FC = () => {
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector(s => s.inn.isEditorOpen);
    const isSaving = useAppSelector(s => s.inn.isSaving);
    const error = useAppSelector(s => s.inn.error);
    const target = useAppSelector(getInnTarget);
    const current = useAppSelector(getCurrentInn);
    const [draft, setDraft] = useState('');

    if (!isOpen || !target) return null;

    const entityLabel =
        target.entity === 'company'
            ? 'компании'
            : target.entity === 'deal'
              ? 'сделки'
              : 'лида';

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
                ИНН {entityLabel}
            </span>
            <Input
                value={draft}
                onChange={event => {
                    setDraft(event.target.value);
                    if (error) dispatch(innActions.clearError());
                }}
                placeholder={current ?? '10 или 12 цифр'}
                inputMode="numeric"
                disabled={isSaving}
                className="h-7 w-40 text-sm"
                aria-label={`ИНН ${entityLabel}`}
            />
            <Button
                size="sm"
                className="h-7 gap-1.5 px-2"
                disabled={isSaving || !draft.trim()}
                onClick={() => dispatch(saveInn(draft))}
            >
                {isSaving ? (
                    // Осветлённая палитра: на тёмной primary-кнопке базовый
                    // градиент выглядел мутно.
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
                aria-label="Закрыть редактор ИНН"
                onClick={() =>
                    dispatch(innActions.setEditorOpen({ isOpen: false }))
                }
            >
                <X aria-hidden className="size-3.5" />
            </Button>
            {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
    );
};
