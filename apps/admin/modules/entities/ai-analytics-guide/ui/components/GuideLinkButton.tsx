'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { GUIDE_PATH, GUIDE_TEXT } from '../../consts/ai-analytics-guide.const';
import { buildGuideSectionHref } from '../../lib/guide-view';

interface GuideLinkButtonProps {
    /** Код раздела путеводителя; без него — оглавление. */
    section?: string;
    portalId?: number;
    size?: 'sm' | 'default';
}

/**
 * Кнопка «Путеводитель» для соседних страниц AI-аналитики (аудит, модель,
 * настройки AI портала): ведёт в нужный раздел и держит выбранный портал.
 */
export const GuideLinkButton = ({
    section,
    portalId,
    size = 'sm',
}: GuideLinkButtonProps) => (
    <Button asChild variant="outline" size={size} title={GUIDE_TEXT.guideButtonTitle}>
        <Link href={section ? buildGuideSectionHref(section, portalId) : GUIDE_PATH}>
            <BookOpen className="size-4" />
            {GUIDE_TEXT.guideButton}
        </Link>
    </Button>
);
