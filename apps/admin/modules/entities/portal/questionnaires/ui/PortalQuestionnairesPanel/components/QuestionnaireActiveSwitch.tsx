'use client';

import { Switch } from '@workspace/ui/components/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { QUESTIONNAIRES_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireRow } from '../../../lib/questionnaire-list-view';

interface QuestionnaireActiveSwitchProps {
    row: QuestionnaireRow;
    /** Эта анкета сейчас пересохраняется. */
    isBusy: boolean;
    onToggle: (row: QuestionnaireRow) => void;
}

/**
 * Переключатель «Включена».
 *
 * Отдельной ручки для флага у бэка нет: включение — это пересохранение
 * анкеты целиком, поэтому переключатель ждёт состав и запирается с
 * объяснением, если пересохранение не прошло бы правила бэка. Молчаливая
 * кнопка, отвечающая 400, хуже запертой.
 */
export const QuestionnaireActiveSwitch = ({
    row,
    isBusy,
    onToggle,
}: QuestionnaireActiveSwitchProps) => {
    const blocked = row.toggleBlockReason;
    const isDisabled = isBusy || row.isDetailLoading || !!blocked;

    const state = row.isActive
        ? QUESTIONNAIRES_TEXT.activeOn
        : QUESTIONNAIRES_TEXT.activeOff;
    const hint = blocked
        ? `${QUESTIONNAIRES_TEXT.toggleBlocked}${blocked}`
        : state;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-2">
                    <Switch
                        checked={row.isActive}
                        disabled={isDisabled}
                        aria-label={hint}
                        onCheckedChange={() => onToggle(row)}
                    />
                    <span className="text-xs text-muted-foreground">
                        {state}
                    </span>
                </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">{hint}</TooltipContent>
        </Tooltip>
    );
};
