import { BlockPostions } from '@/modules/entities/offer-template-konstructor';

export type PositionBase = {
    top: number;
    bottom: number;
    left: number;
    right: number;
};
export const getPostionCurrentItemId = (
    current: PositionBase,
    positions: BlockPostions,
): number | undefined => {
    const searched = positions.find(
        position =>
            position.top === current.top &&
            position.bottom === current.bottom &&
            position.left === current.left &&
            position.right === current.right,
    );
    return searched?.id;
};
