'use client';

import { Badge } from '@workspace/ui/components/badge';
import { QUESTIONNAIRE_MATRIX_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireMatrixLooseCard } from '../../../lib/questionnaire-matrix';
import { QuestionnaireMatrixItem } from './QuestionnaireMatrixItem';

interface QuestionnaireLooseBlockProps {
    portalId: number;
    cards: QuestionnaireMatrixLooseCard[];
}

/**
 * Анкеты, у которых строки в матрице нет.
 *
 * Их условия типа события не касаются: только стадия, только статус работы
 * либо «всегда». Спрятать их было бы прямым враньём — владелец решил бы,
 * что таких анкет нет вовсе, и завёл бы их заново. Поэтому у каждой видно
 * назначение, её собственные условия чипсами и причина, по которой строки
 * нет.
 */
export const QuestionnaireLooseBlock = ({
    portalId,
    cards,
}: QuestionnaireLooseBlockProps) => (
    <section className="flex flex-col gap-2">
        <div className="max-w-3xl">
            <h2 className="text-sm font-semibold">
                {QUESTIONNAIRE_MATRIX_TEXT.looseTitle}
            </h2>
            <p className="text-muted-foreground text-xs">
                {QUESTIONNAIRE_MATRIX_TEXT.looseHint}
            </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(card => (
                <div
                    key={card.id}
                    className="flex flex-col gap-1.5 rounded-md border p-2"
                >
                    <QuestionnaireMatrixItem portalId={portalId} card={card} />

                    <div className="flex flex-wrap items-center gap-1">
                        <Badge variant="secondary">{card.purposeLabel}</Badge>
                        {card.conditions.map(condition => (
                            <Badge
                                key={condition.kind}
                                variant="outline"
                                title={condition.title}
                                className="max-w-full truncate"
                            >
                                {condition.label}
                            </Badge>
                        ))}
                    </div>

                    <p className="text-muted-foreground text-xs">
                        {QUESTIONNAIRE_MATRIX_TEXT.looseReason[card.reason]}
                    </p>
                </div>
            ))}
        </div>
    </section>
);
