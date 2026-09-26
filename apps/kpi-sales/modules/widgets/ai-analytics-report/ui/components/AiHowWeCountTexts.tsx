'use client';

import type { AiAbout } from '@/modules/entities/ai-analytics';

interface AiHowWeCountListProps {
    title: string;
    items: string[];
}

/** Список пунктов блока; пустой список не рисуется. */
const AiHowWeCountList = ({ title, items }: AiHowWeCountListProps) =>
    items.length ? (
        <section className="space-y-1">
            <h4 className="text-sm font-medium">{title}</h4>
            <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
                {items.map((item, index) => (
                    <li key={`${index}-${item}`}>{item}</li>
                ))}
            </ul>
        </section>
    ) : null;

interface AiHowWeCountTextsProps {
    about: AiAbout;
}

/** Слова ручки с бэка: источники данных, как читать результат, чего не делаем. */
export const AiHowWeCountTexts = ({ about }: AiHowWeCountTextsProps) => (
    <div className="grid gap-4 md:grid-cols-3">
        <AiHowWeCountList title="Источники данных" items={about.sources} />
        <AiHowWeCountList title="Как читать" items={about.howToRead} />
        <AiHowWeCountList title="Чего не делаем" items={about.notDoing} />
    </div>
);
