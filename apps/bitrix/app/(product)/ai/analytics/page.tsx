import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_ANALYTICS } from '../constants/pages/analytics';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_ANALYTICS);

export default function AiAnalyticsPage() {
    return <AiTheoryPage page={AI_ANALYTICS} />;
}
