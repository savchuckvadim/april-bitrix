import React from 'react';
import { HowContentPage } from '../components/HowContentPage';
import { CALIBRATION_PAGE } from '../constants/pages/calibration';

export const metadata = {
    title: 'Калибровка AI-аналитики звонков — чтобы система оценивала звонки так же, как вы',
    description: CALIBRATION_PAGE.description,
};

export default function CalibrationPage() {
    return <HowContentPage page={CALIBRATION_PAGE} />;
}
