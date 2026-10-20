'use client';

import { useMemo } from 'react';
import { FieldCombobox } from '@workspace/april-ui/fields';
// Глубокий импорт чистого util, а не индекса аудита: индекс тянет панель
// аудита, которая сама импортирует кнопку путеводителя — был бы цикл.
import { toPortalOptions } from '@/modules/entities/ai-analytics-audit/lib/portal-options.util';
import { usePortals } from '@/modules/entities/portal';
import { GUIDE_TEXT } from '../../../consts/ai-analytics-guide.const';
import { findPortalByDomain, findPortalById } from '../../../lib/guide-view';

interface GuidePortalSelectProps {
    portalId: number | undefined;
    onChange: (portalId: number | undefined) => void;
}

/**
 * Выбор портала: комбобокс по домену (общий util аудита), в адрес уходит
 * id портала — им резолвятся ссылки в карточку, доменом — формы «Запуск».
 */
export const GuidePortalSelect = ({ portalId, onChange }: GuidePortalSelectProps) => {
    const portals = usePortals();
    const options = useMemo(() => toPortalOptions(portals.data), [portals.data]);
    const selected = findPortalById(portals.data, portalId);

    return (
        <FieldCombobox
            id="guide-portal"
            label={GUIDE_TEXT.portal}
            options={options}
            value={selected?.domain ?? undefined}
            onChange={domain =>
                onChange(findPortalByDomain(portals.data, domain)?.id)
            }
            placeholder={GUIDE_TEXT.portalPlaceholder}
            searchPlaceholder={GUIDE_TEXT.portalSearch}
            emptyText={GUIDE_TEXT.portalEmpty}
            hint={GUIDE_TEXT.portalHint}
            className="max-w-md"
        />
    );
};
