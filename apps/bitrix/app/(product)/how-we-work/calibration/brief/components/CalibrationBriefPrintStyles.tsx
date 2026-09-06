import React from 'react';
import { BRIEF_PRINT_CSS } from '../constants/print-css';

/**
 * Печатные стили брифа. Серверный компонент: styled-jsx здесь потребовал бы
 * 'use client' ради статичной строки, поэтому CSS вставляем как есть.
 */
export const CalibrationBriefPrintStyles: React.FC = () => (
    <style dangerouslySetInnerHTML={{ __html: BRIEF_PRINT_CSS }} />
);
