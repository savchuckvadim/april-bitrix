'use client';

import Link from 'next/link';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import {
    QUESTIONNAIRES_TEXT,
    QUESTIONNAIRE_MATRIX_TEXT,
} from '../../../consts/questionnaires.const';
import type { QuestionnaireMatrixCard } from '../../../lib/questionnaire-matrix';

interface QuestionnaireMatrixItemProps {
    portalId: number;
    card: QuestionnaireMatrixCard;
}

/**
 * Анкета внутри ячейки матрицы.
 *
 * Отвечает ровно на «что спросят и в каком она состоянии»: название,
 * включена ли, сколько вопросов, есть ли сломанные привязки. Выключенная
 * анкета показывается ЗДЕСЬ ЖЕ, а не прячется: владелец должен видеть, что
 * вопросы для этого типа события заведены, но менеджеру не показываются —
 * иначе он завёл бы их второй раз.
 *
 * Пометка «общая» стоит у анкеты, которая сработает не только на этом типе:
 * без неё правка из клетки «Решение» выглядела бы правкой одного Решения.
 *
 * Строкой «только если ещё» идут остальные условия анкеты: они выполняются
 * ОДНОВРЕМЕННО с типом события, и без них клетка обещала бы вопросы, которых
 * менеджер здесь не увидит.
 */
export const QuestionnaireMatrixItem = ({
    portalId,
    card,
}: QuestionnaireMatrixItemProps) => (
    <Link
        href={`/portal/${portalId}/questionnaires/${card.id}`}
        title={card.code}
        className={cn(
            'hover:bg-accent block rounded-md border px-2 py-1.5 transition-colors',
            !card.isActive && 'border-dashed opacity-70',
        )}
    >
        <span className="flex items-start gap-1.5">
            <span className="text-sm leading-snug">{card.title}</span>
            {card.isShared && (
                <Badge
                    variant="outline"
                    className="shrink-0"
                    title={`${QUESTIONNAIRE_MATRIX_TEXT.sharedHint}${card.sharedWith.join(', ')}`}
                >
                    {QUESTIONNAIRE_MATRIX_TEXT.shared}
                </Badge>
            )}
        </span>

        {card.alsoRequires.length > 0 && (
            <span
                className="text-muted-foreground mt-1 block text-[11px] leading-snug"
                title={`${QUESTIONNAIRE_MATRIX_TEXT.alsoRequiresHint}${card.alsoRequires
                    .map(condition => condition.title)
                    .join('; ')}`}
            >
                {QUESTIONNAIRE_MATRIX_TEXT.alsoRequires}{' '}
                {card.alsoRequires.map(condition => condition.label).join('; ')}
            </span>
        )}

        <span className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 text-xs">
            <Badge variant={card.isActive ? 'secondary' : 'outline'}>
                {card.isActive
                    ? QUESTIONNAIRES_TEXT.activeOn
                    : QUESTIONNAIRES_TEXT.activeOff}
            </Badge>
            {/* Выключатель по типам события гасит анкету целиком — это не
                то же самое, что её собственный флаг «Включена», и владелец
                должен видеть обе причины молчания. */}
            {card.isSilenced && (
                <Badge
                    variant="outline"
                    title={QUESTIONNAIRE_MATRIX_TEXT.cardSilencedHint}
                >
                    {QUESTIONNAIRE_MATRIX_TEXT.cardSilenced}
                </Badge>
            )}
            <span>
                {card.itemsCount} {QUESTIONNAIRE_MATRIX_TEXT.cellItems}
            </span>
            {card.issuesCount > 0 && (
                <Badge
                    variant="destructive"
                    title={QUESTIONNAIRE_MATRIX_TEXT.cellIssues}
                >
                    {card.issuesCount}
                </Badge>
            )}
        </span>
    </Link>
);
