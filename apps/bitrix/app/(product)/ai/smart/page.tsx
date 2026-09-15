import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_SMART } from '../constants/pages/smart';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_SMART);

export default function AiSmartPage() {
    return <AiTheoryPage page={AI_SMART} />;
}
