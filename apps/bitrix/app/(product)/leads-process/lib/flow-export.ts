import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import { toPng } from 'html-to-image';

const EXPORT_PADDING = 40;
const MAX_EXPORT_SIZE = 4096;

/**
 * Снимает PNG (dataURL) с канваса React Flow: кадр строится по границам
 * нод, а не по текущему зуму/скроллу пользователя.
 */
export const exportFlowPng = async (
    wrapper: HTMLElement,
    nodes: Node[],
): Promise<string> => {
    const viewportElement = wrapper.querySelector<HTMLElement>(
        '.react-flow__viewport',
    );
    if (!viewportElement || nodes.length === 0) {
        throw new Error('Канвас пуст — нечего экспортировать');
    }

    const bounds = getNodesBounds(nodes);
    const width = Math.min(bounds.width + EXPORT_PADDING * 2, MAX_EXPORT_SIZE);
    const height = Math.min(
        bounds.height + EXPORT_PADDING * 2,
        MAX_EXPORT_SIZE,
    );
    const viewport = getViewportForBounds(bounds, width, height, 0.2, 2, 0.06);

    return toPng(viewportElement, {
        backgroundColor: getComputedStyle(wrapper).backgroundColor,
        width,
        height,
        pixelRatio: 2,
        style: {
            width: `${width}px`,
            height: `${height}px`,
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
    });
};

/** Имя PNG-файла варианта схемы. */
export const variantFileName = (flowId: string): string =>
    `leads-flow-${flowId}-variant.png`;
