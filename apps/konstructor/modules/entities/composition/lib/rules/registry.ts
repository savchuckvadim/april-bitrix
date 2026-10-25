import type { Rule } from '../../model/types';
import { academyRule } from './academy';
import { consaltingRule } from './consalting';
import { erRule } from './er-packets';
import { freeBlocksRule } from './free-blocks';
import { infoblockRule } from './infoblock-links';
import { ltRule } from './lt';
import { ltOtherRule } from './lt-other';
import { notChangingRule } from './not-changing';
import { regionsRule } from './regions';
import { starRule } from './star';
import { weightRule } from './weight-rule';

/**
 * Реестр правил формирования комплекта (этап 5.1). Порядок важен только для
 * валидаторов (порядок нарушений в подсветке); действие применяет первое
 * правило, объявившее его в `actions`.
 */
export const COMPOSITION_RULES: readonly Rule[] = [
    infoblockRule,
    freeBlocksRule,
    erRule,
    ltRule,
    ltOtherRule,
    consaltingRule,
    starRule,
    academyRule,
    regionsRule,
    notChangingRule,
    weightRule,
];
