'use client';

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@workspace/ui/components/alert';
import { AlertTriangle, Info } from 'lucide-react';
import type { QuestionnaireFieldNotice } from '../../../lib/field-picker-view';

interface QuestionnaireFieldPickerNoticesProps {
    /** Про носителя: куда уедет ответ либо почему поля взять нельзя. */
    sourceNotice: QuestionnaireFieldNotice | null;
    /** Поля прочитаны урезанным способом — без символьных кодов. */
    degradedNotice: QuestionnaireFieldNotice | null;
}

/**
 * Честные плашки над списком полей.
 *
 * Владелец читает их ДО выбора поля, а не в тексте отказа: почему поля
 * смарта сейчас недоступны и что для этого поменять в условиях; в какой
 * элемент уедет ответ, когда доступны; почему поля, читанные без прав
 * администратора CRM, привязываются только по UF-имени.
 */
export const QuestionnaireFieldPickerNotices = ({
    sourceNotice,
    degradedNotice,
}: QuestionnaireFieldPickerNoticesProps) => {
    if (!sourceNotice && !degradedNotice) return null;

    return (
        <div className="space-y-2">
            {[sourceNotice, degradedNotice]
                .filter(
                    (notice): notice is QuestionnaireFieldNotice => !!notice,
                )
                .map(notice => (
                    <Alert key={notice.title}>
                        {/* Запрет и адрес ответа — разные вещи: значок
                            отличает «так нельзя» от «вот куда уедет». */}
                        {notice.tone === 'warning' ? (
                            <AlertTriangle className="h-4 w-4" />
                        ) : (
                            <Info className="h-4 w-4" />
                        )}
                        <AlertTitle className="text-sm font-medium">
                            {notice.title}
                        </AlertTitle>
                        {notice.description && (
                            <AlertDescription className="text-xs text-muted-foreground">
                                {notice.description}
                            </AlertDescription>
                        )}
                    </Alert>
                ))}
        </div>
    );
};
