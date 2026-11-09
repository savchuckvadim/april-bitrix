import { TrendingDown } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent } from '@workspace/ui/components/card';
import { HUB_AI_LEAKS, HUB_AI_SECTION } from '../model/hub';

/** Иллюстрация раздела «Где теряем продажи» — с честной пометкой «пример». */
export function AiLeaksPreview() {
    return (
        <Card className="py-0 shadow-2xl">
            <CardContent className="flex flex-col gap-5 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <TrendingDown className="size-5 text-destructive" aria-hidden />
                        {HUB_AI_SECTION.exampleTitle}
                    </p>
                    <Badge variant="outline">{HUB_AI_SECTION.exampleBadge}</Badge>
                </div>
                <ol className="flex flex-col gap-4">
                    {HUB_AI_LEAKS.map(leak => (
                        <li key={leak.title} className="rounded-xl border border-border bg-muted/30 p-4">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <p className="font-semibold text-foreground">{leak.title}</p>
                                {leak.money && <p className="font-semibold text-destructive">{leak.money}</p>}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{leak.scale}</p>
                            <p className="mt-2 text-sm text-foreground">
                                <span className="text-success">Что сделать: </span>
                                {leak.action}
                            </p>
                        </li>
                    ))}
                </ol>
            </CardContent>
        </Card>
    );
}
