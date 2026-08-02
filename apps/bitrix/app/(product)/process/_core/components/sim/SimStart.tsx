'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { Play } from 'lucide-react';
import { GlassCard } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    RadioGroup,
    RadioGroupItem,
} from '@workspace/ui/components/radio-group';
import { cn } from '@workspace/ui/lib/utils';
import {
    SIM_ARRIVING_EVENTS,
    SIM_PLANNABLE_EVENTS,
} from '../../constants/sim-events';
import { ACTOR_LABEL } from '../../lib/actor.util';
import type { ProcessDefinition, ProcessModel } from '../../types';
import { ReadinessBadge } from '../ReadinessBadge';

interface SimStartProps {
    definition: ProcessDefinition;
    model: ProcessModel;
    /** Первая стадия, где в работу включается человек. */
    startIndex: number;
    onStart: (
        entryPointId: string,
        company: string,
        stageIndex: number,
        eventCode: string,
    ) => void;
}

/**
 * Стартовые данные симулятора.
 *
 * Начать можно как с самого начала, так и с середины: клиента могли передать
 * от другого сотрудника или вернуть из буфера — тогда работа начинается не с
 * холодного звонка.
 */
export const SimStart: FC<SimStartProps> = ({
    definition,
    model,
    startIndex,
    onStart,
}) => {
    const [entryPointId, setEntryPointId] = useState(
        definition.entryPoints[0]?.id ?? 'lead',
    );
    const [company, setCompany] = useState('ООО «Пример»');
    const [stageIndex, setStageIndex] = useState(startIndex);
    const [eventCode, setEventCode] = useState('cold');

    return (
        <GlassCard intensity="strong" className="rounded-2xl p-5">
            <h2 className="text-foreground text-lg font-bold">
                С чего начинаем?
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
                Симулятор пройдёт процесс по вашим настройкам. Начать можно с
                нуля или с середины — как будто клиента передали вам.
            </p>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <fieldset>
                    <legend className="text-primary text-xs font-bold tracking-widest uppercase">
                        Откуда клиент
                    </legend>
                    <RadioGroup
                        value={entryPointId}
                        onValueChange={setEntryPointId}
                        className="mt-2 gap-1.5"
                    >
                        {definition.entryPoints.map(entry => (
                            <div
                                key={entry.id}
                                className="flex items-center gap-2"
                            >
                                <RadioGroupItem
                                    id={`entry-${entry.id}`}
                                    value={entry.id}
                                    className="cursor-pointer"
                                />
                                <Label
                                    htmlFor={`entry-${entry.id}`}
                                    className="flex cursor-pointer items-center gap-1.5 text-xs font-normal"
                                >
                                    {entry.label}
                                    <ReadinessBadge value={entry.readiness} />
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </fieldset>

                <fieldset>
                    <legend className="text-primary text-xs font-bold tracking-widest uppercase">
                        На какой стадии подхватываем
                    </legend>
                    <RadioGroup
                        value={String(stageIndex)}
                        onValueChange={value => setStageIndex(Number(value))}
                        className="mt-2 max-h-56 gap-1.5 overflow-y-auto pr-1"
                    >
                        {model.stages.map((view, index) => (
                            <div
                                key={view.stage.id}
                                className="flex items-center gap-2"
                            >
                                <RadioGroupItem
                                    id={`stage-${view.stage.id}`}
                                    value={String(index)}
                                    disabled={view.stage.isClosing}
                                    className="cursor-pointer"
                                />
                                <Label
                                    htmlFor={`stage-${view.stage.id}`}
                                    className={cn(
                                        'cursor-pointer text-xs font-normal',
                                        view.stage.isClosing &&
                                            'text-muted-foreground/50 cursor-not-allowed',
                                    )}
                                >
                                    {view.stage.label}
                                    <span className="text-muted-foreground">
                                        {' '}
                                        ·{' '}
                                        {ACTOR_LABEL[view.actor].toLowerCase()}
                                    </span>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </fieldset>

                <fieldset>
                    <legend className="text-primary text-xs font-bold tracking-widest uppercase">
                        Что вам запланировали
                    </legend>
                    <RadioGroup
                        value={eventCode}
                        onValueChange={setEventCode}
                        className="mt-2 gap-1.5"
                    >
                        {[...SIM_ARRIVING_EVENTS, ...SIM_PLANNABLE_EVENTS].map(
                            event => (
                                <div
                                    key={event.code}
                                    className="flex items-center gap-2"
                                >
                                    <RadioGroupItem
                                        id={`event-${event.code}`}
                                        value={event.code}
                                        className="cursor-pointer"
                                    />
                                    <Label
                                        htmlFor={`event-${event.code}`}
                                        className="cursor-pointer text-xs font-normal"
                                    >
                                        {event.emoji && `${event.emoji} `}
                                        {event.label}
                                    </Label>
                                </div>
                            ),
                        )}
                    </RadioGroup>
                </fieldset>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <Input
                    value={company}
                    onChange={event => setCompany(event.target.value)}
                    placeholder="Название компании"
                    className="w-full sm:w-64"
                />

                <Button
                    onClick={() =>
                        onStart(entryPointId, company, stageIndex, eventCode)
                    }
                    className="gap-1.5"
                >
                    <Play className="size-4" />
                    Начать
                </Button>
            </div>
        </GlassCard>
    );
};
