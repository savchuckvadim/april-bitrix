import React from 'react';
import { AiTheoryPage } from '../../components/AiTheoryPage';
import { AI_CALL_ANALYSIS } from '../../constants/pages/call-analysis';
import { aiPageMetadata } from '../../lib/page-metadata';

export const metadata = aiPageMetadata(AI_CALL_ANALYSIS);

export default function AiCallAnalysisPage() {
    return <AiTheoryPage page={AI_CALL_ANALYSIS} />;
}
