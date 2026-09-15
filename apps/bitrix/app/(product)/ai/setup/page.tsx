import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_SETUP } from '../constants/pages/setup';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_SETUP);

export default function AiSetupPage() {
    return <AiTheoryPage page={AI_SETUP} />;
}
