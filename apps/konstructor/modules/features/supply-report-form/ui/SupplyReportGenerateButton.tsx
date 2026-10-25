'use client';

import { Check, ExternalLink, Truck } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { useSupplyGenerate } from '../hooks/use-supply-generate';

/** «Сформировать отчёт»: процесс поставки по галке, блокер, незаполненное, результат. */
export const SupplyReportGenerateButton = () => {
    const generate = useSupplyGenerate();
    const hint = generate.blocker ?? (generate.missing.length ? `Не заполнено: ${generate.missing.join(', ')}` : null);

    return (
        <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
                <Checkbox
                    checked={generate.needProcess}
                    onCheckedChange={checked => generate.setNeedProcess(checked === true)}
                />
                Запустить процесс поставки
            </label>
            {generate.needProcess && generate.existingRpaId ? (
                <p className="text-xs text-muted-foreground">Заявка № {generate.existingRpaId} будет обновлена</p>
            ) : null}
            <Button
                className="w-full"
                onClick={() => void generate.run()}
                disabled={Boolean(generate.blocker) || generate.isGenerating}
            >
                {generate.isDone ? <Check className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                {generate.isGenerating ? 'Формирую…' : 'Сформировать отчёт'}
            </Button>
            {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
            {generate.error ? <p className="text-xs text-destructive">{generate.error}</p> : null}
            {generate.isDone && generate.createdRpaId ? (
                <p className="text-xs text-muted-foreground">Заявка RPA № {generate.createdRpaId}</p>
            ) : null}
            {generate.isDone && generate.link ? (
                <a
                    href={generate.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
                >
                    <ExternalLink className="h-3 w-3" />
                    Отчёт о поставке (DOCX)
                </a>
            ) : null}
        </div>
    );
};
