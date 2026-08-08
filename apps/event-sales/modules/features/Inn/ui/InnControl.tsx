'use client';

import { FC } from 'react';
import { Hash, Pencil, Plus } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { multifieldValues } from '@/modules/features/ClientSignals/lib/signal-validate';
import { getCurrentInn, getInnTarget } from '../lib/inn-selectors';
import { innActions } from '../model/InnSlice';
import { InnEditor } from './InnEditor';

interface InnControlProps {
    /**
     * Тонкая строка вместо блока: только значок и значение, всё остальное —
     * в тултипе. Для шапки списка дел, где вертикаль на вес золота.
     */
    compact?: boolean;
}

/**
 * ИНН текущей сущности: значение с карандашом или «Записать ИНН»; по клику
 * раскрывается микро-редактор. Поле не проинсталлено на портале — контрол не
 * рендерится вовсе (§5 доктрины).
 */
export const InnControl: FC<InnControlProps> = ({ compact = false }) => {
    const dispatch = useAppDispatch();
    const target = useAppSelector(getInnTarget);
    const current = useAppSelector(getCurrentInn);
    const isOpen = useAppSelector(s => s.inn.isEditorOpen);

    if (!target) return null;

    const open = () => dispatch(innActions.setEditorOpen({ isOpen: true }));
    // Склад кандидатов: показываем в тултипе — «возможные варианты» рядом
    // с текущим ИНН, без места на экране.
    const pool = multifieldValues(target.poolValues).filter(
        value => value !== current,
    );
    const entityLabel =
        target.entity === 'company'
            ? 'компании'
            : target.entity === 'deal'
              ? 'сделки'
              : 'лида';

    if (compact) {
        if (isOpen) return <InnEditor />;
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        onClick={open}
                        className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <Hash aria-hidden className="size-3" />
                        {current ? `ИНН: ${current}` : 'ИНН: —'}
                        {pool.length > 0 && (
                            <span className="text-muted-foreground/70">
                                +{pool.length}
                            </span>
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start">
                    <p className="text-primary-foreground/70">
                        ИНН {entityLabel}
                    </p>
                    <p className="font-medium">{current ?? 'не заполнен'}</p>
                    {pool.length > 0 && (
                        <p className="text-primary-foreground/70">
                            Ещё встречались: {pool.join(', ')}
                        </p>
                    )}
                    <p className="text-primary-foreground/70">
                        Нажмите, чтобы {current ? 'изменить' : 'записать'}
                    </p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <div className="flex min-w-0 flex-col gap-1">
            {!isOpen && (
                <button
                    type="button"
                    onClick={open}
                    className="inline-flex w-fit cursor-pointer items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                    {current ? (
                        <>
                            <span className="font-medium">ИНН {current}</span>
                            <Pencil aria-hidden className="size-3" />
                        </>
                    ) : (
                        <>
                            <Plus aria-hidden className="size-3" />
                            Записать ИНН
                        </>
                    )}
                </button>
            )}
            <InnEditor />
        </div>
    );
};
