import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_SETTINGS } from '../constants/pages/settings';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_SETTINGS);

export default function AiSettingsPage() {
    return <AiTheoryPage page={AI_SETTINGS} />;
}
