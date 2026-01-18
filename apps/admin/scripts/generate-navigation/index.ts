#!/usr/bin/env tsx

/**
 * Генератор навигации для админки
 * 
 * Читает entity-summary.ts и генерирует allEntities для Sidebar
 * Запуск: pnpm generate:navigation
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface EntitySummaryItem {
    name: string;
    title: string;
    route: string;
    parent?: string;
    children?: string[];
}

/**
 * Преобразует имя в множественное число
 */
function toPlural(str: string): string {
    // Если уже заканчивается на s, возвращаем как есть
    if (str.endsWith('s') || str.endsWith('es')) {
        return str;
    }
    
    if (str.endsWith('y')) {
        return str.slice(0, -1) + 'ies';
    }
    if (str.endsWith('x') || str.endsWith('ch') || str.endsWith('sh')) {
        return str + 'es';
    }
    if (str.endsWith('app')) {
        return str + 's'; // bitrix-app -> bitrix-apps
    }
    return str + 's';
}

/**
 * Преобразует route в URL (убирает / в начале, обрабатывает параметры)
 */
function routeToUrl(route: string): string {
    // Убираем / в начале
    let url = route.startsWith('/') ? route.slice(1) : route;
    
    // Заменяем параметры на простой путь
    // /portal/:portalId/portal-measures -> portal/portal-measures
    url = url.replace(/\/:[^/]+/g, '');
    
    return url;
}

/**
 * Генерирует allEntities из entity-summary
 */
function generateAllEntities(summary: EntitySummaryItem[]): string {
    // Создаем карту имен -> ID
    const nameToId = new Map<string, number>();
    const rootEntities = summary.filter(e => !e.parent);
    const childEntities = summary.filter(e => e.parent);
    let currentId = 0;
    
    // Присваиваем ID корневым сущностям
    rootEntities.forEach(entity => {
        nameToId.set(entity.name, currentId++);
    });
    
    // Присваиваем ID дочерним сущностям (для relations)
    childEntities.forEach(entity => {
        if (!nameToId.has(entity.name)) {
            nameToId.set(entity.name, currentId++);
        }
    });
    
    // Создаем карту parent -> children для relations
    const parentToChildren = new Map<string, string[]>();
    summary.forEach(entity => {
        if (entity.parent) {
            if (!parentToChildren.has(entity.parent)) {
                parentToChildren.set(entity.parent, []);
            }
            parentToChildren.get(entity.parent)!.push(entity.name);
        }
    });
    
    // Генерируем entities только для корневых (без parent)
    const entities = rootEntities.map(entity => {
        const id = nameToId.get(entity.name)!;
        const url = routeToUrl(entity.route);
        const pluralName = toPlural(entity.name);
        const pluralTitle = toPlural(entity.title);
        
        // Определяем relations (ID дочерних сущностей)
        const children = entity.children || parentToChildren.get(entity.name) || [];
        const relations = children
            .map(childName => nameToId.get(childName))
            .filter((id): id is number => id !== undefined);
        
        return `    {
        id: ${id},
        item: {
            name: '${entity.name}',
            title: '${entity.title}',
            type: ENTITY_QUANTITY.ENTITY,
            get: {
                url: '/${url}',
                method: API_METHOD.GET
            }
        },
        items: {
            name: '${pluralName}',
            title: '${pluralTitle}',
            type: ENTITY_QUANTITY.ENTITIES,
            get: {
                url: '/${url}',
                method: API_METHOD.GET
            }
        },
        relations: [${relations.join(', ')}]
    }`;
    });
    
    return `import { API_METHOD } from "@workspace/api"

export type ALL_ENTITIES = Entity[]
enum ENTITY_QUANTITY {
    ENTITY = 'entity',
    ENTITIES = 'entities',
}
export type Entity = {
    id: number;
    item: {
        name: string;
        title: string;
        type: ENTITY_QUANTITY;
        get: {
            url: string;
            method: API_METHOD;
        };
    };
    items: {
        name: string;
        title: string;
        type: ENTITY_QUANTITY;
        get: {
            url: string;
            method: API_METHOD;
        };
    };
    relations: number[];
}

export const allEntities: Entity[] = [
${entities.join(',\n\n')}
];
`;
}

async function main() {
    console.log('🔍 Чтение entity-summary.ts...\n');
    
    // Путь к entity-summary.ts
    const summaryPath = join(
        __dirname,
        '../../modules/entities/entity-summary.ts',
    );
    
    // Путь для сохранения initial-entities.ts
    const outputPath = join(
        __dirname,
        '../../app/lib/initial-entities.ts',
    );
    
    try {
        // Читаем entity-summary.ts
        const summaryContent = readFileSync(summaryPath, 'utf-8');
        
        // Извлекаем entitySummary массив
        // Простой парсинг - ищем export const entitySummary
        const match = summaryContent.match(
            /export const entitySummary:\s*EntitySummaryItem\[\]\s*=\s*(\[[\s\S]*?\]);/,
        );
        
        if (!match || !match[1]) {
            console.error('❌ Не удалось найти entitySummary в файле');
            return;
        }
        
        // Парсим JSON
        const summary: EntitySummaryItem[] = JSON.parse(match[1]);
        
        console.log(`✅ Найдено ${summary.length} сущностей\n`);
        
        // Генерируем allEntities
        const generatedContent = generateAllEntities(summary);
        
        // Сохраняем файл
        writeFileSync(outputPath, generatedContent, 'utf-8');
        
        console.log(`✅ Создан: app/lib/initial-entities.ts`);
        console.log(`\n📊 Статистика:`);
        console.log(`   - Корневых сущностей: ${summary.filter(e => !e.parent).length}`);
        console.log(`   - Дочерних сущностей: ${summary.filter(e => e.parent).length}`);
        console.log(`   - Всего entities в навигации: ${summary.filter(e => !e.parent).length}`);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }
}

main().catch(console.error);

