import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_ROP } from '../constants/pages/rop';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_ROP);

export default function AiRopPage() {
    return <AiTheoryPage page={AI_ROP} />;
}
