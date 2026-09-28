import { describe, expect, it } from 'vitest';
import {
    brief,
    briefBullet,
} from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import {
    AI_BRIEF_COMPARISON_TEXT,
    AI_BRIEF_DEFAULT_GROUP,
    AI_BRIEF_DELTA_WORDS,
    AI_BRIEF_DESCRIPTION_FALLBACK,
    AI_BRIEF_GROUPS,
    AI_BRIEF_NO_COMPARISON_TEXT,
    AI_BRIEF_TITLE,
    aiBriefComparisonText,
    aiBriefDeltaWord,
    aiBriefDescription,
    buildAiBriefGroups,
    hasAiBriefBulletMeta,
    resolveAiBriefGroup,
    showsAiBriefManagerChip,
    type AiBriefBulletSource,
} from '../ai-brief-view.util';

const PERIOD = { from: '2026-08-01', to: '2026-08-31' };
const CARD_LINK = 'https://april.bitrix24.ru/crm/type/1036/details/128/';

/** Группы и тексты пунктов — коротко, для сравнения порядка. */
const layout = (bullets: readonly AiBriefBulletSource[] | null | undefined) =>
    buildAiBriefGroups(bullets).map(group => [
        group.title,
        group.bullets.map(bullet => bullet.text),
    ]);

describe('ai-brief-view.util — группы пунктов', () => {
    it('заголовок карточки и три группы в порядке показа', () => {
        expect(AI_BRIEF_TITLE).toBe(
            'Итоги периода: что изменилось и что сделать',
        );
        expect(AI_BRIEF_GROUPS.map(item => item.group)).toEqual([
            'change',
            'focus',
            'action',
        ]);
        expect(AI_BRIEF_GROUPS.map(item => item.title)).toEqual([
            'Что изменилось',
            'На кого смотреть',
            'Что сделать на неделе',
        ]);
    });

    it('пункты раскладываются по группе пункта, а не по месту в списке', () => {
        expect(
            layout([
                briefBullet({ text: 'Дело 1', group: 'action' }),
                briefBullet({ text: 'Менеджер 1', group: 'focus' }),
                briefBullet({ text: 'Изменение 1', group: 'change' }),
                briefBullet({ text: 'Дело 2', group: 'action' }),
                briefBullet({ text: 'Изменение 2', group: 'change' }),
            ]),
        ).toEqual([
            ['Что изменилось', ['Изменение 1', 'Изменение 2']],
            ['На кого смотреть', ['Менеджер 1']],
            ['Что сделать на неделе', ['Дело 1', 'Дело 2']],
        ]);
    });

    it('пустые группы не показываем', () => {
        expect(
            layout([briefBullet({ text: 'Дело', group: 'action' })]),
        ).toEqual([['Что сделать на неделе', ['Дело']]]);
        expect(
            layout([
                briefBullet({ text: 'Изменение', group: 'change' }),
                briefBullet({ text: 'Дело', group: 'action' }),
            ]).map(([title]) => title),
        ).toEqual(['Что изменилось', 'Что сделать на неделе']);
        expect(buildAiBriefGroups([])).toEqual([]);
        expect(buildAiBriefGroups(null)).toEqual([]);
        expect(buildAiBriefGroups(undefined)).toEqual([]);
    });

    it('незнакомая группа — в «Что изменилось»', () => {
        expect(resolveAiBriefGroup('brand_new')).toBe(AI_BRIEF_DEFAULT_GROUP);
        expect(resolveAiBriefGroup('')).toBe('change');
        expect(resolveAiBriefGroup(null)).toBe('change');
        expect(resolveAiBriefGroup(7)).toBe('change');
        expect(resolveAiBriefGroup('focus')).toBe('focus');
        expect(resolveAiBriefGroup('action')).toBe('action');
        expect(
            layout([
                { text: 'Новый вид пункта', group: 'brand_new' },
                briefBullet({ text: 'Дело', group: 'action' }),
            ]),
        ).toEqual([
            ['Что изменилось', ['Новый вид пункта']],
            ['Что сделать на неделе', ['Дело']],
        ]);
    });

    it('итоги, собранные раньше (у пунктов нет группы), — все пункты в «Что изменилось»', () => {
        const groups = buildAiBriefGroups([
            { text: 'Шаг с датой ставится в 42 % звонков.' },
            { text: 'Презентаций стало 12.', managerId: '7' },
        ]);
        expect(groups).toHaveLength(1);
        expect(groups[0]?.group).toBe('change');
        expect(groups[0]?.bullets.map(bullet => bullet.text)).toEqual([
            'Шаг с датой ставится в 42 % звонков.',
            'Презентаций стало 12.',
        ]);
        expect(groups[0]?.bullets[0]).toMatchObject({
            managerId: null,
            callType: null,
            link: null,
            deltaWord: null,
        });
        expect(groups[0]?.bullets[1]?.managerId).toBe('7');
    });

    it('пункт без текста пропускаем; ключи пунктов не повторяются', () => {
        const groups = buildAiBriefGroups([
            briefBullet({ text: '   ' }),
            briefBullet({ text: 'Одно и то же' }),
            briefBullet({ text: 'Одно и то же' }),
            briefBullet({ text: 'Одно и то же', group: 'action' }),
        ]);
        const keys = groups.flatMap(group =>
            group.bullets.map(bullet => bullet.key),
        );
        expect(keys).toHaveLength(3);
        expect(new Set(keys).size).toBe(3);
    });

    it('стандартные итоги из фикстуры — одна группа изменений', () => {
        expect(layout(brief().bullets)).toEqual([
            ['Что изменилось', ['Шаг с датой ставится в 42 % звонков.']],
        ]);
    });
});

describe('ai-brief-view.util — пункт к показу', () => {
    it('на кого смотреть: менеджер, тип звонка и ссылка на разбор', () => {
        const [group] = buildAiBriefGroups([
            briefBullet({
                text: 'Три сигнала риска без разбора.',
                group: 'focus',
                managerId: '7',
                callType: 'presentation',
                link: CARD_LINK,
                delta: 3,
            }),
        ]);
        expect(group?.bullets[0]).toMatchObject({
            group: 'focus',
            managerId: '7',
            callType: 'presentation',
            link: CARD_LINK,
            // Слово изменения — только у группы «Что изменилось».
            deltaWord: null,
        });
    });

    it('ссылка — только адрес страницы; пусто или не адрес — ссылки нет', () => {
        const links = buildAiBriefGroups([
            briefBullet({ text: 'а', group: 'action', link: CARD_LINK }),
            briefBullet({ text: 'б', group: 'action', link: null }),
            briefBullet({ text: 'в', group: 'action', link: '   ' }),
            briefBullet({ text: 'г', group: 'action', link: 'javascript:1' }),
            { text: 'д', group: 'action' },
        ])[0]?.bullets.map(bullet => bullet.link);
        expect(links).toEqual([CARD_LINK, null, null, null, null]);
    });

    it('строка с чипами нужна, только когда есть что показать', () => {
        const [plain, withDelta, withLink] =
            buildAiBriefGroups([
                briefBullet({ text: 'а' }),
                briefBullet({ text: 'б', delta: 0 }),
                briefBullet({ text: 'в', link: CARD_LINK }),
            ])[0]?.bullets ?? [];
        expect(plain && hasAiBriefBulletMeta(plain)).toBe(false);
        expect(withDelta && hasAiBriefBulletMeta(withDelta)).toBe(true);
        expect(withLink && hasAiBriefBulletMeta(withLink)).toBe(true);
    });

    it('на кого смотреть: имя стоит над текстом — чипа менеджера и пустой строки под текстом нет', () => {
        const views = buildAiBriefGroups([
            briefBullet({ text: 'а', group: 'change', managerId: '7' }),
            briefBullet({ text: 'б', group: 'focus', managerId: '7' }),
            briefBullet({ text: 'в', group: 'action', managerId: '7' }),
            briefBullet({
                text: 'г',
                group: 'focus',
                managerId: '7',
                callType: 'presentation',
            }),
        ]).flatMap(group => group.bullets);
        // Порядок показа: изменение, два пункта «на кого смотреть», дело.
        expect(views.map(view => view.text)).toEqual(['а', 'б', 'г', 'в']);
        expect(views.map(showsAiBriefManagerChip)).toEqual([
            true,
            false,
            false,
            true,
        ]);
        expect(views.map(hasAiBriefBulletMeta)).toEqual([
            true,
            false,
            true,
            true,
        ]);
    });
});

describe('ai-brief-view.util — слово изменения', () => {
    it('по знаку: больше, меньше, без изменений', () => {
        expect(aiBriefDeltaWord(3)).toBe('больше');
        expect(aiBriefDeltaWord(0.02)).toBe('больше');
        expect(aiBriefDeltaWord(-0.08)).toBe('меньше');
        expect(aiBriefDeltaWord(-15000)).toBe('меньше');
        expect(aiBriefDeltaWord(0)).toBe('без изменений');
        expect(aiBriefDeltaWord(-0)).toBe('без изменений');
    });

    it('сравнения нет — слова нет', () => {
        expect(aiBriefDeltaWord(null)).toBeNull();
        expect(aiBriefDeltaWord(undefined)).toBeNull();
        expect(aiBriefDeltaWord(Number.NaN)).toBeNull();
        expect(aiBriefDeltaWord(Number.POSITIVE_INFINITY)).toBeNull();
    });

    it('только слова: без стрелок, знаков и чисел', () => {
        for (const word of Object.values(AI_BRIEF_DELTA_WORDS)) {
            expect(word).toMatch(/^[а-яё ]+$/);
        }
    });

    it('в пункте слово есть только у изменений с числом', () => {
        const words = buildAiBriefGroups([
            briefBullet({ text: 'а', delta: -0.08 }),
            briefBullet({ text: 'б', delta: 2 }),
            briefBullet({ text: 'в', delta: 0 }),
            briefBullet({ text: 'г', delta: null }),
        ])[0]?.bullets.map(bullet => bullet.deltaWord);
        expect(words).toEqual(['меньше', 'больше', 'без изменений', null]);
    });
});

describe('ai-brief-view.util — подпись карточки', () => {
    it('сравнение есть: период и «в сравнении с» прошлым периодом', () => {
        expect(aiBriefDescription(PERIOD, brief())).toBe(
            '01.08 – 31.08, в сравнении с 01.07–31.07',
        );
        expect(aiBriefComparisonText(brief())).toBe(
            'в сравнении с 01.07–31.07',
        );
    });

    it('сравнения нет: «сравнения с прошлым периодом пока нет»', () => {
        const incomparable = brief({ comparable: false, previousPeriod: null });
        expect(aiBriefDescription(PERIOD, incomparable)).toBe(
            `01.08 – 31.08, ${AI_BRIEF_NO_COMPARISON_TEXT}`,
        );
        expect(AI_BRIEF_NO_COMPARISON_TEXT).toBe(
            'сравнения с прошлым периодом пока нет',
        );
        // Даты прошлого периода есть, но периоды несопоставимы.
        expect(aiBriefComparisonText(brief({ comparable: false }))).toBe(
            AI_BRIEF_NO_COMPARISON_TEXT,
        );
    });

    it('итоги, собранные раньше (полей сравнения нет), — сравнения нет', () => {
        expect(aiBriefDescription(PERIOD, {})).toBe(
            `01.08 – 31.08, ${AI_BRIEF_NO_COMPARISON_TEXT}`,
        );
    });

    it('сравнение есть, а дат прошлого периода нет — без дат', () => {
        expect(
            aiBriefComparisonText({ comparable: true, previousPeriod: null }),
        ).toBe(AI_BRIEF_COMPARISON_TEXT);
    });

    it('итоги ещё собираются — только период; периода нет — общая подпись', () => {
        expect(aiBriefDescription(PERIOD, null)).toBe('01.08 – 31.08');
        expect(aiBriefDescription(PERIOD, undefined)).toBe('01.08 – 31.08');
        expect(aiBriefDescription({ from: null, to: null }, brief())).toBe(
            AI_BRIEF_DESCRIPTION_FALLBACK,
        );
        expect(aiBriefDescription({ from: '2026-08-01', to: null }, null)).toBe(
            AI_BRIEF_DESCRIPTION_FALLBACK,
        );
    });
});
