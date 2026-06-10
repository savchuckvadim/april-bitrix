import { DomainTreeNodeDto } from '@workspace/ai-api/src/generated/model';
import { FlatTreeNode, PromptKind, TreeNode } from './types';

export function flattenTree(
    node: DomainTreeNodeDto | undefined,
    depth = 0
): FlatTreeNode[] {
    if (!node) return [];
    const current: FlatTreeNode = {
        name: node.name,
        path: node.path,
        type: node.type,
        size: node.size ?? null,
        depth,
    };

    const children = (node.children ?? []).flatMap((child) =>
        flattenTree(child, depth + 1)
    );

    return [current, ...children];
}

export function findKindNode(root: TreeNode | undefined, kind: PromptKind) {
    return root?.children?.find((child) => child.name === kind);
}

export function findRetriveNode(root: TreeNode | undefined, kind: PromptKind) {
    const kindNode = findKindNode(root, kind);
    return kindNode?.children?.find((child) => child.name === 'retrive');
}

export function getRetriveRelativePath(kind: PromptKind, fullPath: string) {
    const prefix = `${kind}/retrive`;
    if (!fullPath || fullPath === prefix) return '';
    if (!fullPath.startsWith(`${prefix}/`)) return '';
    return fullPath.slice(prefix.length + 1);
}
