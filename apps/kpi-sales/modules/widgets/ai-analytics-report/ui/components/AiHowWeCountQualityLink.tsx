'use client';

import type {
    AiAboutQualityLink,
    AiReadiness,
} from '@/modules/entities/ai-analytics';
import { buildAiAboutQualityLink } from '../../lib/ai-about-quality-link.util';
import { AiHowWeCountSection } from './AiHowWeCountSection';

interface AiHowWeCountQualityLinkProps {
    link: AiAboutQualityLink;
    /** Готовность по модели портала (источник связи, счётчик); null — модели нет. */
    readiness: AiReadiness | null;
}

/** «Связь качества с результатом»: оценка, проверки, серия и счётчик. */
export const AiHowWeCountQualityLink = ({
    link,
    readiness,
}: AiHowWeCountQualityLinkProps) => (
    <AiHowWeCountSection
        view={buildAiAboutQualityLink(link, readiness)}
        topic="qualityLink"
    />
);
