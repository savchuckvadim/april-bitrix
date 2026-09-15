import React from 'react';
import { AiTheoryPage } from '../../components/AiTheoryPage';
import { AI_CALL_TYPES } from '../../constants/pages/call-types';
import { aiPageMetadata } from '../../lib/page-metadata';

export const metadata = aiPageMetadata(AI_CALL_TYPES);

export default function AiCallTypesPage() {
    return <AiTheoryPage page={AI_CALL_TYPES} />;
}
