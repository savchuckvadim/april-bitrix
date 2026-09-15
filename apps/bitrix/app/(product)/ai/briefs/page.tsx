import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_BRIEFS } from '../constants/pages/briefs';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_BRIEFS);

export default function AiBriefsPage() {
    return <AiTheoryPage page={AI_BRIEFS} />;
}
