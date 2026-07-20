import React from 'react';
import { Download } from 'lucide-react';

interface DownloadPdfButtonProps {
    /** Путь к заранее сгенерированному PDF в public/ (см. constants/vendor.ts) */
    href: string;
    /** Имя файла при сохранении */
    fileName: string;
    /** Подпись кнопки */
    label?: string;
}

/**
 * Кнопка «Скачать PDF» — прямая ссылка на ЗАРАНЕЕ сгенерированный файл
 * (`public/legal/*.pdf`, делает `pnpm gen:legal-pdf`).
 *
 * Раньше здесь был `window.print()` — системный диалог печати. Заменено на
 * готовый файл: пользователь получает предсказуемый документ с постоянным
 * именем (это же важно для модерации Маркета и для отправки контрагенту).
 * Прецедент в проекте — `public/offer/offer.pdf`.
 *
 * Серверный компонент: никакой клиентской логики не нужно.
 */
export const DownloadPdfButton: React.FC<DownloadPdfButtonProps> = ({
    href,
    fileName,
    label = 'Скачать PDF',
}) => (
    <a
        href={href}
        download={fileName}
        target="_blank"
        rel="noopener noreferrer"
        className="no-print inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
    >
        <Download className="h-4 w-4" />
        {label}
    </a>
);
