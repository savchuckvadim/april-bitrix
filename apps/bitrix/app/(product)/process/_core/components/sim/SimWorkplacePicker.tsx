'use client';

import type { FC } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import type { SimWorkplace } from '../../lib/simulator.util';

interface SimWorkplacePickerProps {
    value: SimWorkplace;
    onChange: (value: SimWorkplace) => void;
    /** Известна ли компания: если нет — это первое, что нужно исправить. */
    isCompanyKnown: boolean;
}

const OPTIONS: {
    code: SimWorkplace;
    label: string;
    sees: string;
}[] = [
    {
        code: 'deal',
        label: 'В сделке',
        sees: 'Видно все привязанные лиды и заявки этой компании — всю историю обращений разом.',
    },
    {
        code: 'lead',
        label: 'В лиде',
        sees: 'Видно только текущий лид. Что было с этой компанией раньше, отсюда не узнать.',
    },
];

/**
 * Выбор места работы в зоне перекрытия.
 *
 * Когда покрытия лида и сделки наложились друг на друга, обе сущности живут
 * одновременно — и менеджер сам решает, откуда работать. Сегодня форма в обоих
 * местах одна и та же, поэтому выбор кажется формальным. Разница в другом: из
 * сделки видно все привязанные лиды и заявки компании, из лида — только
 * текущий.
 *
 * Компания и ИНН могут отсутствовать и там, и там: это тот самый десятый
 * случай, когда на входе определить не удалось. По регламенту их добавляют как
 * можно раньше — иначе к концу пути привязывать историю будет не к чему.
 */
export const SimWorkplacePicker: FC<SimWorkplacePickerProps> = ({
    value,
    onChange,
    isCompanyKnown,
}) => {
    const active = OPTIONS.find(option => option.code === value);

    return (
        <div className="border-primary/40 bg-primary/5 rounded-xl border p-3">
            <p className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
                Здесь живут обе сущности — выбирайте, откуда работать
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
                {OPTIONS.map(option => (
                    <button
                        key={option.code}
                        type="button"
                        onClick={() => onChange(option.code)}
                        aria-pressed={value === option.code}
                        className={cn(
                            'focus-visible:outline-primary cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-2',
                            value === option.code
                                ? 'border-primary bg-primary/10 text-primary font-semibold'
                                : 'text-muted-foreground hover:border-primary',
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <p className="text-foreground/90 mt-2 text-xs leading-relaxed">
                {active?.sees}
            </p>
            <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                Сама форма отчёта пока одинаковая: сегодня разница только в том,
                что видно вокруг неё.
            </p>

            {!isCompanyKnown && (
                <p className="border-warning/50 bg-warning/10 text-warning mt-2 flex gap-2 rounded-lg border px-3 py-2 text-[11px] leading-relaxed">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                        Компания и ИНН не определены — и в лиде, и в сделке их
                        может не быть. По регламенту добавить нужно как можно
                        раньше: пока компании нет, привязать к ней историю
                        обращений не к чему.
                    </span>
                </p>
            )}
        </div>
    );
};
