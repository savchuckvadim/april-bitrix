'use client';

import { Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { RqFillBadge } from './RqFillBadge';
import { RqFieldValue } from './RqFieldValue';
import { useBaseCard } from '../lib/hooks/use-base-card';

/**
 * Основные поля текущего реквизита. Окно правки открывает BxRqDraftModals
 * на уровне экрана: карточка живёт во вкладке, а вкладка снимается с экрана.
 */
export const BxRqBaseEdit = () => {
    const card = useBaseCard();
    const busy = card.isSaving || card.isLoading;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>Основная информация</span>
                        {!card.isEmpty ? <RqFillBadge percent={card.percent} /> : null}
                    </div>
                    {!card.isEmpty ? (
                        <Button variant="ghost" size="sm" onClick={card.startEdit} disabled={busy}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Редактировать
                        </Button>
                    ) : null}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!card.isEmpty ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {card.fields.map(field => (
                            <RqFieldValue key={field.code} field={field} />
                        ))}
                        {card.isSimpleBankCommentMode ? (
                            <RqFieldValue
                                label="Прочие реквизиты"
                                value={card.bankComment}
                                multiline
                            />
                        ) : null}
                    </div>
                ) : (
                    <div className="p-6 text-center">
                        <p className="text-muted-foreground">
                            {card.isTemplate
                                ? 'Реквизит ещё не создан: заполните поля, и он появится в карточке компании Битрикса.'
                                : 'Реквизиты не заполнены'}
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={card.startEdit}
                            className="mt-2"
                            disabled={busy}
                        >
                            <Edit2 className="mr-2 h-4 w-4" />
                            {card.isTemplate ? 'Заполнить реквизиты' : 'Добавить реквизиты'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
