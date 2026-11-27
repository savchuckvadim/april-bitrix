'use client';

import { Field } from '@workspace/ui/shared';
import { cn } from '@workspace/ui/lib/utils';

const DOCX_MIME =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export interface InvoiceFileFieldProps {
    file: File | null;
    /** Правка: файл необязателен, прежний остаётся. */
    isEditing: boolean;
    error?: string;
    onPick: (file: File | null) => void;
}

/** Выбор файла шаблона .docx. */
export const InvoiceFileField = ({
    file,
    isEditing,
    error,
    onPick,
}: InvoiceFileFieldProps) => (
    <Field
        label="Файл .docx"
        required={!isEditing}
        error={error}
        helperText={
            isEditing ? 'Новый файл нужен, только если документ меняется.' : undefined
        }
    >
        <input
            type="file"
            id="invoice-template-file"
            accept={`.docx,${DOCX_MIME}`}
            className="sr-only"
            onChange={event => onPick(event.target.files?.[0] ?? null)}
        />
        <label
            htmlFor="invoice-template-file"
            className={cn(
                'inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-input bg-muted/30 px-4 py-3 text-sm transition-colors hover:bg-muted/50',
                error && 'border-destructive',
            )}
        >
            {file
                ? file.name
                : isEditing
                  ? 'Загрузить новый файл (необязательно)'
                  : 'Выберите файл .docx'}
        </label>
    </Field>
);
