'use client';

import { useCallback } from 'react';
import { Bitrix } from '@workspace/bitrix';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getEntityCardPath, getEntityCardUrl } from '../entity-url';
import type { RelatedEntityType } from '../../model';

/**
 * Открытие карточки CRM из встройки — без побочных эффектов.
 *
 * Во фрейме Битрикса правильный способ — СЛАЙДЕР поверх портала: менеджер
 * остаётся в той же карточке и возвращается закрытием слайдера. Новая
 * вкладка — только запасной путь (dev вне фрейма или отказ слайдера), иначе
 * человек уезжает из приложения и теряет контекст работы.
 *
 * Возвращает `true`, если карточку удалось открыть: вызывающему бывает важно
 * знать, случился переход или нет.
 */
export const useOpenEntityCard = () => {
    const domain = useAppSelector(state => state.app.domain);

    return useCallback(
        async (
            entityType: RelatedEntityType,
            entityId: number,
        ): Promise<boolean> => {
            const path = getEntityCardPath(entityType, entityId);
            if (path) {
                try {
                    // Вне фрейма сервиса Bitrix нет — в dev это норма.
                    const status =
                        await Bitrix.getService().api.openSlider(path);
                    if (status) return true;
                } catch (error) {
                    console.debug('openSlider skipped', error);
                }
            }

            const url = getEntityCardUrl(domain, entityType, entityId);
            if (!url) return false;
            window.open(url, '_blank', 'noreferrer');
            return true;
        },
        [domain],
    );
};
