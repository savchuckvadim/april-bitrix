'use client';

import { Check, FileText } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { DocumentLinks } from '@/modules/shared/ui/DocumentLinks/DocumentLinks';
import { useOfferPdfDocument } from '../model/OfferPdfDocumentContext';

/**
 * «Сформировать PDF»: блокер формирования (в том числе обязательный тип
 * клиента), результат — предупреждения бэка и ссылки на все файлы КП и счетов.
 */
export const OfferPdfGenerateButton = () => {
    const { generateBlocker, generate, outcome, runGenerate } = useOfferPdfDocument();
    const isGenerating = generate.status === 'generating';

    return (
        <div className="flex flex-col gap-2">
            <Button
                className="w-full"
                onClick={() => void runGenerate()}
                disabled={Boolean(generateBlocker) || isGenerating}
            >
                {generate.status === 'done' ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                {isGenerating ? 'Формирую…' : 'Сформировать PDF'}
            </Button>
            {generateBlocker ? <p className="text-xs text-muted-foreground">{generateBlocker}</p> : null}
            {generate.error ? <p className="text-xs text-destructive">{generate.error}</p> : null}
            {outcome ? <DocumentLinks warnings={outcome.warnings} links={outcome.links} /> : null}
            {generate.result?.savedToDeal ? (
                <p className="text-xs text-muted-foreground">Файл прикреплён к сделке и отмечен в её истории.</p>
            ) : null}
            {generate.result?.dealMessage ? (
                <p className="text-xs text-warning">{generate.result.dealMessage}</p>
            ) : null}
            {generate.result?.missingAssets?.length ? (
                <p className="text-xs text-warning">
                    Документ собран без оформления стиля: на сервере нет его картинок или логотипа. Сообщите
                    администратору.
                </p>
            ) : null}
        </div>
    );
};
