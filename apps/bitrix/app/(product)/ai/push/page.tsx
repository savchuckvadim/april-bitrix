import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_PUSH } from '../constants/pages/push';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_PUSH);

export default function AiPushPage() {
    return <AiTheoryPage page={AI_PUSH} />;
}
