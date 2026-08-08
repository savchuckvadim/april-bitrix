'use client';

import { FC } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getCurrentInn, getInnTarget } from '../lib/inn-selectors';
import { innActions } from '../model/InnSlice';
import { InnEditor } from './InnEditor';

/**
 * ИНН текущей сущности одной строкой: значение с карандашом или «Записать
 * ИНН»; по клику раскрывается микро-редактор. Ставится в шапки всех экранов —
 * список дел, отчёт, полноэкранная карточка: записать ИНН можно не только из
 * дела. Поле не проинсталлено на портале — не рендерится вовсе (§5 доктрины).
 */
export const InnControl: FC = () => {
    const dispatch = useAppDispatch();
    const target = useAppSelector(getInnTarget);
    const current = useAppSelector(getCurrentInn);
    const isOpen = useAppSelector(s => s.inn.isEditorOpen);

    if (!target) return null;

    return (
        <div className="flex min-w-0 flex-col gap-1">
            {!isOpen && (
                <button
                    type="button"
                    onClick={() =>
                        dispatch(innActions.setEditorOpen({ isOpen: true }))
                    }
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
