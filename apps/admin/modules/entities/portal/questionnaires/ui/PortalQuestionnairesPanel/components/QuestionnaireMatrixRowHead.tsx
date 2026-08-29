'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Switch } from '@workspace/ui/components/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { QUESTIONNAIRE_MATRIX_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireMatrixRow } from '../../../lib/questionnaire-matrix';

interface QuestionnaireMatrixRowHeadProps {
    row: QuestionnaireMatrixRow;
    /** Настройки портала прочитаны — выключателем есть чем управлять. */
    isSwitchReady: boolean;
    isSwitchSaving: boolean;
    onToggle: (eventType: string, isDisabled: boolean) => void;
}

/**
 * Шапка строки матрицы — сам тип события.
 *
 * Кроме названия и кода здесь две вещи, которые владелец иначе не увидел
 * бы нигде: у типа события есть смарт (значит ответы могут уехать в его
 * элемент, и поля смарта доступны анкете этого типа) и выключатель анкет
 * для этого типа. Выключатель — та же настройка портала, что читают фрейм
 * и бэк отчёта: второго значения у неё нет, поэтому и переключается она
 * прямо здесь, а не отдельной копией в разделе анкет.
 */
export const QuestionnaireMatrixRowHead = ({
    row,
    isSwitchReady,
    isSwitchSaving,
    onToggle,
}: QuestionnaireMatrixRowHeadProps) => (
    <div className="space-y-1">
        <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm">{row.label}</span>
            {row.hasSmart && (
                <Badge
                    variant="secondary"
                    title={QUESTIONNAIRE_MATRIX_TEXT.rowSmartHint}
                >
                    {QUESTIONNAIRE_MATRIX_TEXT.rowSmart}
                </Badge>
            )}
        </span>
        <span className="text-muted-foreground block font-mono text-[11px]">
            {row.code}
        </span>

        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-2">
                    <Switch
                        checked={!row.isDisabled}
                        disabled={!isSwitchReady || isSwitchSaving}
                        aria-label={`${QUESTIONNAIRE_MATRIX_TEXT.rowSwitch}: ${row.label}`}
                        onCheckedChange={checked =>
                            onToggle(row.code, !checked)
                        }
                    />
                    <span className="text-muted-foreground text-[11px]">
                        {QUESTIONNAIRE_MATRIX_TEXT.rowSwitch}{' '}
                        {row.isDisabled
                            ? QUESTIONNAIRE_MATRIX_TEXT.rowSwitchOff
                            : QUESTIONNAIRE_MATRIX_TEXT.rowSwitchOn}
                    </span>
                </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
                {isSwitchReady
                    ? QUESTIONNAIRE_MATRIX_TEXT.rowSwitchHint
                    : QUESTIONNAIRE_MATRIX_TEXT.rowSwitchPending}
            </TooltipContent>
        </Tooltip>
    </div>
);
