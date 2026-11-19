import type { ReactNode } from 'react';

interface CallsListCellLinkProps {
    /** Ссылка строки на разбор; нет — просто текст. */
    href: string | null;
    children: ReactNode;
}

/**
 * Содержимое ячейки — обычная ссылка на разбор: клик открывает разбор в том
 * же окне приложения, правой кнопкой — «открыть в новом окне» с любой
 * ячейки строки. Фокус клавиатуры — только у «Открыть» в конце строки,
 * чтобы Tab не проходил строку восемь раз.
 */
export const CallsListCellLink = ({ href, children }: CallsListCellLinkProps) =>
    href ? (
        <a href={href} tabIndex={-1} className="block text-inherit no-underline">
            {children}
        </a>
    ) : (
        <>{children}</>
    );
