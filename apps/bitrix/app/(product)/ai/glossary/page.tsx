import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_GLOSSARY } from '../constants/pages/glossary';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_GLOSSARY);

export default function AiGlossaryPage() {
    return <AiTheoryPage page={AI_GLOSSARY} />;
}
