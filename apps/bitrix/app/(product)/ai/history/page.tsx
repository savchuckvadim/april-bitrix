import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_HISTORY } from '../constants/pages/history';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_HISTORY);

export default function AiHistoryPage() {
    return <AiTheoryPage page={AI_HISTORY} />;
}
