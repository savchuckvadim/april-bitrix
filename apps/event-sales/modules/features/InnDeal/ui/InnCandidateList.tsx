'use client';

import { FC } from 'react';
import { EyeOff } from 'lucide-react';
import { ToneBadge } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import {
    RadioGroup,
    RadioGroupItem,
} from '@workspace/ui/components/radio-group';
import type { InnCandidate } from '../model';
import { innDigitsLabel, innStrengthTone } from '../lib/inn-deal-view';

interface InnCandidateListProps {
    candidates: InnCandidate[];
    current: string;
    disabled: boolean;
    readOnly: boolean;
    onChoose: (inn: string) => void;
    onHide: (inn: string) => void;
}

/**
 * Варианты ИНН радиокнопками: выбор — это одно действие, а не форма.
 *
 * Подписи источников («из реквизита компании», «из заявки (лид №…)», «из
 * названия — проверьте») приходят с бэка готовыми: решение о том, насколько
 * источнику верить, принимается там же, где собираются данные.
 */
export const InnCandidateList: FC<InnCandidateListProps> = ({
    candidates,
    current,
    disabled,
    readOnly,
    onChoose,
    onHide,
}) => {
    if (!candidates.length) {
        return (
            <p className="text-xs text-muted-foreground">
                Вариантов пока нет: ИНН не нашёлся ни в заявке, ни в карточке
                клиента, ни в его реквизитах. Добавьте вручную.
            </p>
        );
    }

    return (
        <RadioGroup
            value={current}
            onValueChange={onChoose}
            className="space-y-1.5"
            disabled={disabled || readOnly}
        >
            {candidates.map(candidate => {
                const id = `inn-candidate-${candidate.inn}`;
                return (
                    <div
                        key={candidate.inn}
                        className="flex items-start gap-2 rounded-md px-1 py-0.5 hover:bg-muted/50"
                    >
                        <RadioGroupItem
                            id={id}
                            value={candidate.inn}
                            className="mt-1 cursor-pointer"
                        />
                        <Label
                            htmlFor={id}
                            className="flex flex-1 cursor-pointer flex-col items-start gap-0.5 font-normal"
                        >
                            <span className="flex flex-wrap items-center gap-1.5">
                                <span className="font-mono text-sm">
                                    {candidate.inn}
                                </span>
                                <ToneBadge
                                    tone={innStrengthTone(candidate.strength)}
                                    variant="soft"
                                    size="sm"
                                >
                                    {innDigitsLabel(candidate.digits)}
                                </ToneBadge>
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {candidate.label}
                            </span>
                        </Label>
                        {!readOnly && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 cursor-pointer text-muted-foreground"
                                aria-label={`Скрыть вариант ${candidate.inn}`}
                                title="Скрыть вариант: «это не наш ИНН»"
                                disabled={disabled || candidate.isCurrent}
                                onClick={() => onHide(candidate.inn)}
                            >
                                <EyeOff aria-hidden className="size-3.5" />
                            </Button>
                        )}
                    </div>
                );
            })}
        </RadioGroup>
    );
};
