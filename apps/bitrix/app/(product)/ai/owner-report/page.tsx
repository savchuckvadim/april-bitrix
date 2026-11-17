import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_OWNER_REPORT } from '../constants/pages/owner-report';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_OWNER_REPORT);

export default function AiOwnerReportPage() {
    return <AiTheoryPage page={AI_OWNER_REPORT} />;
}
