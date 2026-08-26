'use client';

import { FC } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useOpenEntityCard } from '@/modules/entities/RelatedCrm/lib/hooks/use-open-entity-card';
import { RELATED_ENTITY_TYPE } from '@/modules/entities/RelatedCrm/model';

/**
 * «Карточка сделки» — слайдер поверх портала: там таб «Гарант: Конструктор
 * КП» с комплектами и ценами. Прямого открытия чужого placement-таба у
 * Битрикса нет (openPath принимает только пути портала), поэтому ведём в
 * карточку сделки — конструктор в одном клике.
 *
 * Гейт — настройка портала `konstructor_slider_enabled`
 * (config.withKonstructorSlider); без сделки кнопки нет.
 */
export const OpenDealSliderButton: FC<{ dealId?: number | null }> = ({
    dealId,
}) => {
    const enabled = useAppSelector(s => s.app.config.withKonstructorSlider);
    const contextDealId = useAppSelector(s => Number(s.app.bitrix.deal?.ID));
    const openCard = useOpenEntityCard();

    const id =
        dealId && dealId > 0
            ? dealId
            : Number.isFinite(contextDealId) && contextDealId > 0
              ? contextDealId
              : null;
    if (!enabled || !id) return null;

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={() => void openCard(RELATED_ENTITY_TYPE.DEAL, id)}
        >
            <ExternalLink aria-hidden className="size-3.5" />
            Карточка сделки — конструктор
        </Button>
    );
};
