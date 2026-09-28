import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_PLANS } from '../constants/pages/plans';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_PLANS);

export default function AiPlansPage() {
    return <AiTheoryPage page={AI_PLANS} />;
}
