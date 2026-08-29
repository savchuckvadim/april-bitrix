'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireLiveOption } from '../../../lib/field-mirror';

interface QuestionnaireLiveOptionRowProps {
    option: QuestionnaireLiveOption;
    /** Завести это значение в анкете. */
    onAdd: () => void;
    /** Взять подпись значения из Битрикса. */
    onAdoptTitle: () => void;
}

/**
 * Одно значение справочника, каким оно сейчас в Битриксе.
 *
 * Показываются ВСЕ живые значения, а не только расхождения: владелец
 * должен видеть набор целиком — иначе «нет в анкете» не с чем сравнить.
 * Разница подписей при этом сама по себе не тревога: подпись менеджеру
 * правят под себя. Тревога — «переименовано», то есть подпись сменилась
 * в портале уже после того, как владелец её принял.
 */
export const QuestionnaireLiveOptionRow = ({
    option,
    onAdd,
    onAdoptTitle,
}: QuestionnaireLiveOptionRowProps) => {
    const isNew = option.ourCode === null;

    return (
        <li className="flex flex-wrap items-center gap-2 text-sm">
            <span className={cn(isNew && 'text-muted-foreground')}>
                {option.title}
            </span>

            {option.bitrixId !== null && (
                <Badge variant="secondary" className="font-mono">
                    {option.bitrixId}
                </Badge>
            )}

            {isNew ? (
                <>
                    <Badge variant="outline">
                        {QUESTIONNAIRE_EDITOR_TEXT.liveFieldOptionNew}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={onAdd}>
                        <Plus className="h-4 w-4" />
                        {QUESTIONNAIRE_EDITOR_TEXT.liveFieldOptionAdd}
                    </Button>
                </>
            ) : (
                <>
                    {option.isRenamed && (
                        <Badge variant="outline">
                            {QUESTIONNAIRE_EDITOR_TEXT.liveFieldOptionRenamed}
                        </Badge>
                    )}
                    {/* Наша подпись показывается только когда она другая:
                        повторять её слово в слово было бы шумом. */}
                    {option.isTitleOurs && (
                        <>
                            <span className="text-xs text-muted-foreground">
                                {QUESTIONNAIRE_EDITOR_TEXT.liveFieldOptionOur}:
                                {` «${option.our ?? ''}»`}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                title={
                                    QUESTIONNAIRE_EDITOR_TEXT.liveFieldOptionAdoptHint
                                }
                                onClick={onAdoptTitle}
                            >
                                {QUESTIONNAIRE_EDITOR_TEXT.liveFieldOptionAdopt}
                            </Button>
                        </>
                    )}
                </>
            )}
        </li>
    );
};
