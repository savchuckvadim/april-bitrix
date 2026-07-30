import { TaskNode } from './TaskNode';
import { GatewayNode } from './GatewayNode';
import { EventNode } from './EventNode';

/** Общая карта кастомных узлов для канваса и редактора. */
export const NODE_TYPES = {
    task: TaskNode,
    gateway: GatewayNode,
    event: EventNode,
};
