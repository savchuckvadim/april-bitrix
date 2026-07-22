'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { PresenceBadge } from '../../../../../lib/ui';
import type { SmartGalleryCard, SmartGallerySource } from '../../../model';

const SOURCE_LABELS: Record<SmartGallerySource, string> = {
    const: 'Const-эталон',
    excel: 'Excel-эталон',
    manual: 'Ручной',
};

/** Строка «Поля N · Воронки M»; для const — с тултипом «по const-эталону». */
function CountsLine({ card }: { card: SmartGalleryCard }) {
    const parts = [
        card.fieldCount !== undefined ? `Поля ${card.fieldCount}` : null,
        card.funnelCount !== undefined ? `Воронки ${card.funnelCount}` : null,
    ].filter((part): part is string => part !== null);
    if (parts.length === 0) return null;

    const line = (
        <p className="text-xs text-muted-foreground">{parts.join(' · ')}</p>
    );
    if (card.source !== 'const') return line;
    return (
        <Tooltip>
            <TooltipTrigger asChild>{line}</TooltipTrigger>
            <TooltipContent>по const-эталону</TooltipContent>
        </Tooltip>
    );
}

/**
 * Карточка смарта в галерее: статус установки, источник (const/excel/manual),
 * группа/тип/entityTypeId, счётчики полей и воронок, для excel — присутствие
 * по осям Bitrix/БД. Действия зависят от статуса и источника.
 */
export function SmartCard({
    card,
    installBusy,
    installDisabled,
    onInstallConst,
    onInstallExcel,
    onShowDetails,
    onOpen,
}: {
    card: SmartGalleryCard;
    /** Идёт полная установка по эталону именно этой карточки. */
    installBusy: boolean;
    /** Установка недоступна (нет домена портала). */
    installDisabled: boolean;
    onInstallConst: () => void;
    onInstallExcel: () => void;
    onShowDetails: () => void;
    onOpen: () => void;
}) {
    return (
        <Card
            className={
                card.installed
                    ? 'h-full border-primary/50'
                    : 'h-full'
            }
        >
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{card.title}</CardTitle>
                    {card.installed ? (
                        <Badge>Установлен</Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="text-muted-foreground"
                        >
                            Не установлен
                        </Badge>
                    )}
                </div>
                <CardDescription className="font-mono text-xs">
                    {card.name}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary">
                        {SOURCE_LABELS[card.source]}
                    </Badge>
                    <Badge variant="outline">{card.group}</Badge>
                    {card.type && (
                        <Badge variant="outline" className="font-mono text-xs">
                            {card.type}
                        </Badge>
                    )}
                    {card.entityTypeId !== undefined && (
                        <Badge variant="outline" className="font-mono text-xs">
                            entityTypeId {card.entityTypeId}
                        </Badge>
                    )}
                </div>
                <CountsLine card={card} />
                {card.source === 'excel' && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Bitrix</span>
                        <PresenceBadge present={!!card.inBitrix} />
                        <span>БД</span>
                        <PresenceBadge present={card.installed} />
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
                {!card.installed && card.source === 'const' && (
                    <Button
                        size="sm"
                        disabled={installDisabled}
                        onClick={onInstallConst}
                    >
                        Установить
                    </Button>
                )}
                {!card.installed && card.source === 'excel' && (
                    <Button
                        size="sm"
                        disabled={installDisabled || installBusy}
                        onClick={onInstallExcel}
                    >
                        {installBusy ? 'Установка…' : 'Установить полностью'}
                    </Button>
                )}
                {card.installed && (
                    <Button size="sm" variant="outline" onClick={onShowDetails}>
                        Детали
                    </Button>
                )}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="sm" variant="outline" onClick={onOpen}>
                            Открыть
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        {card.installed
                            ? 'Страница смарта: сопоставление эталона с Bitrix и БД по полям и значениям, синхронизация.'
                            : 'Страница смарта: эталонный состав полей со статусом «не установлено», установка целиком или по полям.'}
                    </TooltipContent>
                </Tooltip>
            </CardFooter>
        </Card>
    );
}
