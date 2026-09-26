import { describe, expect, it } from 'vitest';
import {
    AI_ROP_MARK_SUPER_USER_HINT,
    aiRopMarkAccess,
} from '../ai-rop-mark-access.util';
import { AI_ROP_MARK_VIEW_AS_HINT } from '../ai-rop-mark-state.util';

describe('aiRopMarkAccess — кто пишет в слепой оценке', () => {
    it('руководитель портала — кнопки записи есть, подсказок нет', () => {
        expect(aiRopMarkAccess(false, false)).toEqual({
            readOnlyHint: null,
            superUserHint: null,
            showWriteControls: true,
        });
    });

    it('суперпользователь вендора — только чтение: кнопки скрыты, строка-пояснение', () => {
        expect(aiRopMarkAccess(false, true)).toEqual({
            readOnlyHint: null,
            superUserHint: AI_ROP_MARK_SUPER_USER_HINT,
            showWriteControls: false,
        });
    });

    it('«Смотреть как…» важнее флага: кнопки видны, но неактивны', () => {
        const expected = {
            readOnlyHint: AI_ROP_MARK_VIEW_AS_HINT,
            superUserHint: null,
            showWriteControls: true,
        };
        expect(aiRopMarkAccess(true, true)).toEqual(expected);
        expect(aiRopMarkAccess(true, false)).toEqual(expected);
    });

    it('текст для суперпользователя — простой и про руководителей портала', () => {
        expect(AI_ROP_MARK_SUPER_USER_HINT).toBe(
            'Вы видите слепую проверку как суперпользователь вендора — метки ставят руководители портала',
        );
    });
});
