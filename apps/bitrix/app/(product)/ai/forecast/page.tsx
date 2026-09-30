import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_FORECAST } from '../constants/pages/forecast';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_FORECAST);

export default function AiForecastPage() {
    return <AiTheoryPage page={AI_FORECAST} />;
}
