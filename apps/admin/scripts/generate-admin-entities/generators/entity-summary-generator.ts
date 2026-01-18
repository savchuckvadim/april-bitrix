import { AdminEntity } from '../parsers/orval-parser';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Преобразует имя сущности в читаемый заголовок
 */
function toTitle(str: string): string {
    return str
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Генерирует summary объект для навигации
 */
export function generateEntitySummary(entities: AdminEntity[]): {
    entities: Array<{
        name: string;
        title: string;
        route: string;
        parent?: string;
        children?: string[];
    }>;
} {
    // Группируем сущности по родителям
    const rootEntities = entities.filter((e) => !e.parentEntity);
    const childEntities = entities.filter((e) => e.parentEntity);

    const summary: Array<{
        name: string;
        title: string;
        route: string;
        parent?: string;
        children?: string[];
    }> = [];

    // Добавляем корневые сущности
    for (const entity of rootEntities) {
        const children = childEntities
            .filter((e) => e.parentEntity === entity.name)
            .map((e) => e.name);

        summary.push({
            name: entity.name,
            title: toTitle(entity.name),
            route: `/${entity.name}`,
            ...(children.length > 0 && { children }),
        });
    }

    // Добавляем дочерние сущности
    for (const entity of childEntities) {
        summary.push({
            name: entity.name,
            title: toTitle(entity.name),
            route: `/${entity.parentEntity}/:${entity.parentEntity}Id/${entity.name}`,
            parent: entity.parentEntity,
        });
    }

    return { entities: summary };
}

/**
 * Сохраняет summary в файл
 */
export function saveEntitySummary(
    summary: ReturnType<typeof generateEntitySummary>,
    outputPath?: string,
): void {
    const defaultPath = join(
        __dirname,
        '../../../modules/entities/entity-summary.ts',
    );
    const path = outputPath || defaultPath;

    const content = `/**
 * Автоматически сгенерированный файл
 * Не редактировать вручную!
 * Используется для навигации и генерации роутов
 */

export interface EntitySummaryItem {
    name: string;
    title: string;
    route: string;
    parent?: string;
    children?: string[];
}

export const entitySummary: EntitySummaryItem[] = ${JSON.stringify(
        summary.entities,
        null,
        2,
    )};

export const rootEntities = entitySummary.filter((e) => !e.parent);

export const getEntityByRoute = (route: string) => {
    return entitySummary.find((e) => e.route === route);
};

export const getChildrenEntities = (parentName: string) => {
    return entitySummary.filter((e) => e.parent === parentName);
};
`;

    writeFileSync(path, content, 'utf-8');
    console.log(`  ✅ Создан summary: ${path}`);
}

