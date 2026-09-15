import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_NEEDS } from '../constants/pages/needs';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_NEEDS);

export default function AiNeedsPage() {
    return <AiTheoryPage page={AI_NEEDS} />;
}
