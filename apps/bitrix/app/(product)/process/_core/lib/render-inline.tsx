import { Fragment } from 'react';
import type { ReactNode } from 'react';

/**
 * Рендер строки контента с поддержкой **жирного** выделения.
 *
 * Другой разметки в контент-константах раздела нет и не планируется: тексты
 * пишутся как проза, а не как разметка. Если понадобится ещё один вид
 * выделения — сначала стоит спросить, точно ли он несёт смысл.
 */
export const renderInline = (text: string): ReactNode =>
    text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
        part.startsWith('**') && part.endsWith('**') ? (
            <strong key={index} className="text-foreground font-semibold">
                {part.slice(2, -2)}
            </strong>
        ) : (
            <Fragment key={index}>{part}</Fragment>
        ),
    );
