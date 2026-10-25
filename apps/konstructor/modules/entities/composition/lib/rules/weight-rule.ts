import { violation, type Rule } from '../../model/types';
import { checkComplectWeight } from '../weight';

/** Вес состава должен сходиться с эталоном комплекта (Максимум — не меньше). */
export const weightRule: Rule = {
    code: 'weight',
    actions: [],
    validate: (composition, ctx) => {
        const check = checkComplectWeight(composition, ctx);
        if (check.matches) return [];
        return [
            violation(
                'weight/mismatch',
                `Неправильный вес комплекта: ${check.weight} вместо ${check.expected}`,
                'warning',
            ),
        ];
    },
};
