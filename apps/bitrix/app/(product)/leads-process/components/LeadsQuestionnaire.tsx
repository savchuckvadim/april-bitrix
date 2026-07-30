'use client';

import React from 'react';
import { HowQuestionnaireId } from '../../how-we-work/constants/types';
import { HOW_QUESTIONNAIRES } from '../../how-we-work/constants/questionnaires';
import { HowQuestionnaire } from '../../how-we-work/components/questionnaire/HowQuestionnaire';
import { collectFlowAttachments } from '../lib/flow-attachments';
import { useFlowVariantCount } from '../hooks/use-flow-variant-count';

interface LeadsQuestionnaireProps {
    questionnaireId: HowQuestionnaireId;
}

/**
 * Лист решений на странице лидов: к скачиваемому протоколу автоматически
 * прикладываются PNG вариантов схем, нарисованных клиентом выше.
 */
export const LeadsQuestionnaire: React.FC<LeadsQuestionnaireProps> = ({
    questionnaireId,
}) => {
    const variantCount = useFlowVariantCount();
    const questionnaire = HOW_QUESTIONNAIRES[questionnaireId];
    if (!questionnaire) return null;

    return (
        <div className="space-y-3">
            <HowQuestionnaire
                questionnaire={questionnaire}
                getAttachments={collectFlowAttachments}
            />
            {variantCount > 0 && (
                <p className="text-sm text-muted-foreground">
                    К протоколу приложатся PNG ваших вариантов схем:{' '}
                    {variantCount} шт. — с вашими подписями.
                </p>
            )}
        </div>
    );
};
