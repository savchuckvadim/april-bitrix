import { Info } from 'lucide-react';

/**
 * Строка вместо блока «Оценка руководителя»: ссылка недействительна, срок
 * истёк, нет права на отзыв. Текст — от бэка или запасной, без кодов.
 */
export const CallLeadNotice = ({ text }: { text: string }) => (
    <p
        role="status"
        className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm"
    >
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" />
        <span>{text}</span>
    </p>
);
