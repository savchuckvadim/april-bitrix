import { describe, expect, it } from 'vitest';
import {
    ACTION_PROMPT_PRIORITY,
    pickActionPrompt,
    type ActionPrompt,
} from './action-prompt';

const prompt = (id: string, priority: number): ActionPrompt => ({
    id,
    question: id,
    actionLabel: 'Сделать',
    tone: 'info',
    priority,
    run: () => {},
});

describe('pickActionPrompt', () => {
    it('на экране одна подсказка — самая важная', () => {
        const picked = pickActionPrompt(
            [
                prompt('helpful', ACTION_PROMPT_PRIORITY.HELPFUL),
                prompt('blocking', ACTION_PROMPT_PRIORITY.BLOCKING),
            ],
            [],
        );
        expect(picked?.id).toBe('blocking');
    });

    it('погашенная уступает место следующей', () => {
        const picked = pickActionPrompt(
            [
                prompt('blocking', ACTION_PROMPT_PRIORITY.BLOCKING),
                prompt('risk', ACTION_PROMPT_PRIORITY.RISK),
            ],
            ['blocking'],
        );
        expect(picked?.id).toBe('risk');
    });

    it('гасить нечего — подсказки нет', () => {
        expect(pickActionPrompt([], [])).toBeNull();
        expect(pickActionPrompt([prompt('one', 1)], ['one'])).toBeNull();
    });
});
