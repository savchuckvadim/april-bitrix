import { describe, expect, it } from 'vitest';
import { buildSurveyTemplateText, FIVE_K_TEMPLATES } from '@workspace/event-sales-flow';
import { afterPresentationActions, afterPresentationReducer } from '../model/AfterPresentationSlice';
import { checkPresentationData } from '../data/check-presentation';
import { buildFiveKSummary } from './check-presentation.persist';

describe('refute-check: untouched 5K blocks in summary', () => {
    it('committed seeded with template text', () => {
        const state = afterPresentationReducer(
            undefined,
            afterPresentationActions.setInitialized({ items: checkPresentationData }),
        );
        const committed = state.checkPresentation.committed;
        console.log('COMMITTED op_5k_client >>>', JSON.stringify(committed.op_5k_client));

        const titleByCode = Object.fromEntries(
            checkPresentationData.map(i => [i.code, `${i.title}:`]),
        );
        const summary = buildFiveKSummary(committed, titleByCode);
        console.log('SUMMARY >>>', JSON.stringify(summary));

        const firstTemplate = buildSurveyTemplateText(FIVE_K_TEMPLATES[0]);
        console.log('CONTAINS TEMPLATE QUESTIONS >>>', summary?.includes(firstTemplate.split('\n')[0]));
    });
});
