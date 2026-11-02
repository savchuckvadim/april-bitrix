import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { buildRenewalPdfPath } from '../model/renewal-offer.link';

export interface RenewalDownloadButtonProps {
    /** Токен ссылки: по нему же собирается PDF. */
    readonly token: string;
}

/**
 * Кнопка «Скачать PDF» ведёт на /renewal/<token>/pdf: файл собирает
 * сервер (@react-pdf/renderer), а не печать браузера. Поэтому у клиента
 * в любом браузере один и тот же документ — без полей и колонтитулов,
 * которые подставляет диалог печати.
 *
 * Обычная ссылка, а не fetch: браузер сам покажет прогресс скачивания,
 * а имя файла придёт из Content-Disposition. Поэтому компонент серверный —
 * ничего интерактивного здесь нет.
 */
export const RenewalDownloadButton: React.FC<RenewalDownloadButtonProps> = ({
    token,
}) => {
    return (
        <Button asChild variant="outline" className="no-print">
            <a href={buildRenewalPdfPath(token)}>
                <Download className="mr-2 h-4 w-4" />
                Скачать PDF
            </a>
        </Button>
    );
};
