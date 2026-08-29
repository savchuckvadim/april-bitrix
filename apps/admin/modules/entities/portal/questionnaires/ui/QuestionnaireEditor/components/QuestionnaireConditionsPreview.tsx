'use client';

import { Eye } from 'lucide-react';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type { PortalQuestionnaireSchema } from '../../../model';
import { describeQuestionnairePreview } from '../../../lib/conditions-preview';
import type { QuestionnaireDraft } from '../../../lib/questionnaire-draft';

interface QuestionnaireConditionsPreviewProps {
    draft: QuestionnaireDraft;
    schema: PortalQuestionnaireSchema | undefined;
}

/**
 * Живой предпросмотр: коды условий, прочитанные вслух.
 *
 * Набор `[{kind: 'reportType', values: ['hot']}]` ничего не говорит о том,
 * увидит ли менеджер анкету. Фраза говорит — и меняется прямо во время
 * правки, поэтому ошибку видно до сохранения, а не по жалобе «анкета не
 * появляется».
 */
export const QuestionnaireConditionsPreview = ({
    draft,
    schema,
}: QuestionnaireConditionsPreviewProps) => (
    <div className="rounded-lg bg-muted/50 p-3">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            {QUESTIONNAIRE_EDITOR_TEXT.previewTitle}
        </p>
        <p className="mt-1 text-sm">
            {describeQuestionnairePreview(draft, schema)}
        </p>
    </div>
);
