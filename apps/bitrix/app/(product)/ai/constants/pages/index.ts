/**
 * Реестр глав раздела AI: slug вкладки → контент страницы.
 *
 * Нужен тесту согласованности: у каждой вкладки `AI_TABS` должна быть глава,
 * и её slug обязан совпадать со slug вкладки — иначе подвал «назад/дальше» и
 * карточки навигации потеряют страницу.
 */

import type { TheoryPageContent } from '../../../process/_core/theory-types';
import { AI_ANALYTICS } from './analytics';
import { AI_BITRIX } from './bitrix';
import { AI_BRIEFS } from './briefs';
import { AI_CALIBRATION } from './calibration';
import { AI_CALL_ANALYSIS } from './call-analysis';
import { AI_CALL_TYPES } from './call-types';
import { AI_GLOSSARY } from './glossary';
import { AI_NEEDS } from './needs';
import { AI_NUMBERS } from './numbers';
import { AI_OVERVIEW } from './overview';
import { AI_PUSH } from './push';
import { AI_ROADMAP } from './roadmap';
import { AI_SETTINGS } from './settings';
import { AI_SETUP } from './setup';
import { AI_SMART } from './smart';

export const AI_PAGES: readonly TheoryPageContent[] = [
    AI_OVERVIEW,
    AI_NEEDS,
    AI_CALL_ANALYSIS,
    AI_CALL_TYPES,
    AI_SMART,
    AI_ANALYTICS,
    AI_NUMBERS,
    AI_PUSH,
    AI_SETTINGS,
    AI_BITRIX,
    AI_SETUP,
    AI_CALIBRATION,
    AI_GLOSSARY,
    AI_ROADMAP,
    AI_BRIEFS,
];
