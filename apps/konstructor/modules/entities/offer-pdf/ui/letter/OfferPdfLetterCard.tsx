'use client';

import { BlurCommitInput, BlurCommitTextarea } from '@workspace/april-ui/fields';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Label } from '@workspace/ui/components/label';
import { LETTER_CARD_TITLE } from '../../lib/offer-letter-texts';
import { useLetterCard } from './hooks/use-letter-card';
import { OfferLetterToggle } from './OfferLetterToggle';

/**
 * Сопроводительное письмо; пустые поля заполнит шаблон. Переключатель в шапке
 * отключает письмо совсем: карточка сворачивается, письма и подписи под ним
 * в КП нет.
 */
export const OfferPdfLetterCard = () => {
    const { letter, setLetter, description, open, setOpen } = useLetterCard();
    return (
        <SectionCard
            title={LETTER_CARD_TITLE}
            description={description}
            tone="complect"
            density="compact"
            collapsible
            open={open}
            onOpenChange={setOpen}
            actions={<OfferLetterToggle />}
        >
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="offer-pdf-appeal">Обращение</Label>
                    <BlurCommitInput
                        id="offer-pdf-appeal"
                        value={letter.appeal}
                        onCommit={appeal => setLetter({ appeal })}
                        placeholder="Уважаемый Иван Иванович!"
                        maxLength={200}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="offer-pdf-letter">Текст письма</Label>
                    <BlurCommitTextarea
                        id="offer-pdf-letter"
                        value={letter.text}
                        onCommit={text => setLetter({ text })}
                        rows={6}
                        maxLength={5000}
                        placeholder="Пусто — письмо портала. Абзацы — с новой строки"
                    />
                    <p className="text-xs text-muted-foreground">
                        Выделить фразу: оберните её в &lt;color&gt;…&lt;/color&gt; (цветом стиля), &lt;bold&gt;…&lt;/bold&gt;
                        (жирным) или &lt;red&gt;…&lt;/red&gt; (красным).
                    </p>
                </div>
            </div>
        </SectionCard>
    );
};
