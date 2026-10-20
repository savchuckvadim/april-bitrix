'use client';

import { formatAiByCalls, formatAiMoment, type AiStyleCard } from '@/modules/entities/ai-analytics';
import {
    aiFunnelShapeLabel,
    formatAiStyleMonth,
    formatAiStyleWindow,
} from '../../lib/ai-style.util';
import { AiStyleNotes } from './AiStyleNotes';
import { AiStyleTagChip } from './AiStyleTagChip';
import { AiStyleAxesTable } from './AiStyleAxesTable';
import { AiStyleHowWeCount } from './AiStyleHowWeCount';

interface AiStyleCardBodyProps {
    card: AiStyleCard;
}

const SECTION_TITLE =
    'text-xs font-semibold uppercase tracking-wide text-muted-foreground';

/** Подвал карточки: месяц профиля, окно, когда рассчитан. */
export const AiStyleCardMeta = ({ card }: AiStyleCardBodyProps) => (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] text-muted-foreground">
        <span>Месяц профиля: {formatAiStyleMonth(card.monthKey)}</span>
        <span>Окно: {formatAiStyleWindow(card.window)}</span>
        <span>
            Рассчитан:{' '}
            {card.generatedAt ? formatAiMoment(card.generatedAt) : '—'}
        </span>
    </div>
);

/**
 * Содержимое карточки стиля (manager/style) — общее для диалога и
 * подвкладки «Стиль» страницы сотрудника: оговорки, заметные особенности,
 * подписи стиля с опорой в числах, оси с отклонением от коллег, форма
 * воронки как контекст, «Как считаем».
 */
export const AiStyleCardBody = ({ card }: AiStyleCardBodyProps) => {
    const tags = card.profile?.tags ?? [];
    return (
        <div className="space-y-4">
            <AiStyleNotes card={card} />
            {card.notable.length > 0 && (
                <section>
                    <h4 className={SECTION_TITLE}>Заметные особенности</h4>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
                        {card.notable.map(item => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </section>
            )}
            {tags.length > 0 && (
                <section>
                    <h4 className={SECTION_TITLE}>Подписи стиля</h4>
                    <ul className="mt-1 space-y-1">
                        {tags.map(tag => (
                            <li
                                key={tag.code}
                                className="flex flex-wrap items-center gap-2 text-xs"
                            >
                                <AiStyleTagChip tag={tag} />
                                <span className="text-muted-foreground">
                                    {tag.basis} · {formatAiByCalls(tag.n)}
                                </span>
                            </li>
                        ))}
                    </ul>
                    {card.profile && (
                        <p className="mt-1 text-[0.6875rem] text-muted-foreground">
                            Сравнимых разборов в окне: {card.profile.calls}
                        </p>
                    )}
                </section>
            )}
            {card.axes.length > 0 && (
                <AiStyleAxesTable axes={card.axes} titleClassName={SECTION_TITLE} />
            )}
            <p className="text-xs text-muted-foreground">
                Форма воронки (контекст, в оси стиля не входит):{' '}
                <span className="font-medium text-foreground">
                    {aiFunnelShapeLabel(card.funnelShape)}
                </span>
            </p>
            <AiStyleHowWeCount items={card.howWeCount} />
        </div>
    );
};
