import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_ROADMAP } from '../constants/pages/roadmap';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_ROADMAP);

export default function AiRoadmapPage() {
    return <AiTheoryPage page={AI_ROADMAP} />;
}
