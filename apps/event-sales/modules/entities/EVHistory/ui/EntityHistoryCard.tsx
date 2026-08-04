'use client';

import { FC, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import type { PortalHistory } from '../lib/hooks/use-portal-history';

interface EntityHistoryCardProps {
    history: PortalHistory;
}

/**
 * История работы: свёрнутая — только последняя запись, обрезанная по строкам.
 * Обрезаем CSS'ом (`line-clamp`), а не по символам: так не рвём слова и не
 * зависим от ширины экрана. Полная история раскрывается на месте и скроллится.
 */
export const EntityHistoryCard: FC<EntityHistoryCardProps> = ({ history }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!history.items.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">История</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {history.isAvailable
                            ? 'Записей пока нет.'
                            : 'Поля истории не установлены на портале.'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                <CardTitle className="text-base">
                    История ({history.items.length})
                </CardTitle>
                {history.items.length > 1 && (
                    <Button
                        variant="link"
                        size="sm"
                        className="h-auto shrink-0 p-0 text-xs"
                        onClick={() => setIsOpen(value => !value)}
                    >
                        {isOpen ? 'Свернуть' : 'Показать всю'}
                    </Button>
                )}
            </CardHeader>

            <CardContent>
                {isOpen ? (
                    <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                        {history.items.map((item, index) => (
                            <li
                                key={`${index}-${item.slice(0, 24)}`}
                                className="border-l-2 border-border pl-2 text-sm leading-relaxed text-muted-foreground"
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {history.latest}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default EntityHistoryCard;
