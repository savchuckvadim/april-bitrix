import React from 'react';
import { AiTheoryPage } from '../components/AiTheoryPage';
import { AI_CALIBRATION } from '../constants/pages/calibration';
import { aiPageMetadata } from '../lib/page-metadata';

export const metadata = aiPageMetadata(AI_CALIBRATION);

export default function AiCalibrationPage() {
    return <AiTheoryPage page={AI_CALIBRATION} />;
}
