import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_QUALITY_LINK } from '../constants/pages/quality-link';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_QUALITY_LINK);

export default function AiQualityLinkPage() {
    return <AiTheoryPage page={AI_QUALITY_LINK} />;
}
