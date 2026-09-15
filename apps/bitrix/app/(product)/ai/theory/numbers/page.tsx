import React from 'react';
import { AiTheoryPage } from '../../components/AiTheoryPage';
import { AI_NUMBERS } from '../../constants/pages/numbers';
import { aiPageMetadata } from '../../lib/page-metadata';

export const metadata = aiPageMetadata(AI_NUMBERS);

export default function AiNumbersPage() {
    return <AiTheoryPage page={AI_NUMBERS} />;
}
