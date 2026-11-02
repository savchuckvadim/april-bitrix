'use client';

import { HookNotice } from '@/modules/entities/hooks/ui/components/HookNotice';
import { METHODOLOGIES_TEXT, type MethodologyValidation } from '../../../model';

interface ValidationNoticeProps {
    /** Результат «Проверить»; null — ещё не проверяли. */
    validation: MethodologyValidation | null;
    /** Ошибки сохранённого конфига строки (из карточки). */
    storedErrors: string[];
}

const ErrorList = ({ errors }: { errors: string[] }) => (
    <ul className="list-disc space-y-0.5 pl-4">
        {errors.map(error => (
            <li key={error}>{error}</li>
        ))}
    </ul>
);

/** Итог проверки конфига: ошибки списком либо сводка «в порядке». */
export const ValidationNotice = ({ validation, storedErrors }: ValidationNoticeProps) => {
    const texts = METHODOLOGIES_TEXT.editor;
    if (validation) {
        if (validation.ok && validation.summary) {
            const { checkpoints, caps, types } = validation.summary;
            return (
                <HookNotice
                    tone="info"
                    title={texts.valid}
                    message={texts.validSummary(checkpoints, caps, types.length)}
                />
            );
        }
        return (
            <HookNotice
                tone="error"
                title={texts.errorsTitle}
                message={<ErrorList errors={validation.errors} />}
            />
        );
    }
    if (storedErrors.length > 0) {
        return (
            <HookNotice
                tone="warning"
                title={texts.storedErrors}
                message={<ErrorList errors={storedErrors} />}
            />
        );
    }
    return null;
};
