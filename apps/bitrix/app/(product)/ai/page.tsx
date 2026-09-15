import React from 'react';
import { AiOverviewView } from './components/AiOverviewView';
import { AI_OVERVIEW } from './constants/pages/overview';
import { aiPageMetadata } from './lib/page-metadata';

export const metadata = aiPageMetadata(AI_OVERVIEW);

export default function AiOverviewPage() {
    return <AiOverviewView />;
}
