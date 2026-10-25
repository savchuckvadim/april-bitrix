'use client';

import { Pencil, Plus } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

export interface InnChipProps {
    value: string | null;
    /** Открыть редактор; не задан — только показ. */
    onEdit?: () => void;
    /** Пустой ИНН «подмигивает» эхом: главный хедер просит его записать. */
    echoWhenEmpty?: boolean;
}

const BASE_CLASS =
    'inline-flex w-fit items-center gap-1 text-xs text-muted-foreground';

const ECHO_CLASS =
    'relative before:pointer-events-none before:absolute before:-inset-1 before:rounded-md before:animate-echo-ring motion-reduce:before:animate-none';

/**
 * ИНН сущности в шапке: значение с карандашом или «Записать ИНН». Без
 * `onEdit` — просто значение (где ИНН не правят, например в конструкторе).
 */
export const InnChip = ({ value, onEdit, echoWhenEmpty = false }: InnChipProps) => {
    if (!onEdit) {
        return (
            <span className={BASE_CLASS}>
                <span className="font-medium">
                    {value ? `ИНН ${value}` : 'ИНН не заполнен'}
                </span>
            </span>
        );
    }

    return (
        <button
            type="button"
            onClick={onEdit}
            className={cn(
                BASE_CLASS,
                'cursor-pointer underline-offset-2 hover:text-foreground hover:underline',
                echoWhenEmpty && !value && ECHO_CLASS,
            )}
        >
            {value ? (
                <>
                    <span className="font-medium">ИНН {value}</span>
                    <Pencil aria-hidden className="size-3" />
                </>
            ) : (
                <>
                    <Plus aria-hidden className="size-3" />
                    Записать ИНН
                </>
            )}
        </button>
    );
};
