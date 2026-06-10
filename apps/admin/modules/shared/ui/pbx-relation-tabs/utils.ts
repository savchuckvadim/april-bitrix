import { GenericEntity, Scalar } from './types';

export function isScalar(value: unknown): value is Scalar {
    const type = typeof value;
    return value == null || type === 'string' || type === 'number' || type === 'boolean';
}

export function getEntityLabel(entity: GenericEntity, fallbackIndex: number): string {
    const titleLike = entity.title ?? entity.name ?? entity.code ?? entity.id;
    if (typeof titleLike === 'string' || typeof titleLike === 'number') {
        return String(titleLike);
    }
    return `Item #${fallbackIndex + 1}`;
}

export function formatScalar(value: Scalar): string {
    if (value == null) return '-';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
}

function isEntityArray(value: unknown): value is GenericEntity[] {
    return Array.isArray(value);
}

export function extractNestedCollections(entity: GenericEntity): Array<{ key: string; data: GenericEntity[] }> {
    return Object.entries(entity).flatMap(([key, value]) => {
        if (!isEntityArray(value)) {
            return [];
        }

        const data = value.filter(
            (item): item is GenericEntity => Boolean(item) && typeof item === 'object'
        );
        return data.length > 0 ? [{ key, data }] : [];
    });
}
