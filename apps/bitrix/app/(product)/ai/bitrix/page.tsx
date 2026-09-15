import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_BITRIX } from '../constants/pages/bitrix';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_BITRIX);

export default function AiBitrixPage() {
    return <AiTheoryPage page={AI_BITRIX} />;
}
