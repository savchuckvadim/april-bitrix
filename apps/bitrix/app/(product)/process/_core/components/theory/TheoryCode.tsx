import type { FC } from 'react';

interface TheoryCodeProps {
    /** Язык — подпись в углу блока: `json`, `bash`, `text`. */
    lang: string;
    code: string;
    caption?: string;
}

/**
 * Пример кода: JSON разбора звонка, ключ настройки, ответ ручки.
 *
 * Подсветки синтаксиса нет намеренно: примеры короткие, а лишняя зависимость
 * ради раскраски пяти строк не окупается. Прокрутка — внутри блока.
 */
export const TheoryCode: FC<TheoryCodeProps> = ({ lang, code, caption }) => (
    <figure className="bg-card overflow-hidden rounded-xl border">
        <div className="bg-muted/50 text-muted-foreground flex items-center justify-between border-b px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase">
            <span>{lang}</span>
        </div>
        <pre className="overflow-x-auto px-4 py-3 text-sm leading-relaxed">
            <code className="text-foreground/90">{code}</code>
        </pre>
        {caption && (
            <figcaption className="text-muted-foreground border-t px-4 py-2 text-xs">
                {caption}
            </figcaption>
        )}
    </figure>
);
