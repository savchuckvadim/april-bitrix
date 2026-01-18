#!/usr/bin/env tsx

/**
 * Генератор модулей админки
 * 
 * Безопасный подход:
 * - НЕ меняет orval.config.ts
 * - Парсит уже сгенерированные файлы из @workspace/nest-api
 * - Использует OpenAPI для дополнительной информации
 * - Легко откатить - просто удалить сгенерированные файлы
 */

import { parseArgs } from 'node:util';
import { discoverAdminEntities } from './parsers/orval-parser';
import { generateEntityModule } from './generators/module-generator';
import {
    generateEntitySummary,
    saveEntitySummary,
} from './generators/entity-summary-generator';

const args = parseArgs({
    options: {
        parse: { type: 'boolean', short: 'p' },
        entity: { type: 'string', short: 'e' },
        all: { type: 'boolean', short: 'a' },
        update: { type: 'boolean', short: 'u' },
        force: { type: 'boolean', short: 'f' },
        dry: { type: 'boolean', short: 'd', default: false },
    },
});

async function main() {
    console.log('🔍 Поиск admin сущностей...\n');

    // 1. Обнаружить все admin сущности
    const entities = await discoverAdminEntities();

    if (entities.length === 0) {
        console.log('❌ Admin сущности не найдены');
        return;
    }

    console.log(`✅ Найдено ${entities.length} admin сущностей:\n`);
    entities.forEach((entity) => {
        console.log(`  - ${entity.name} (${entity.apiPrefix})`);
        console.log(`    Методы: ${entity.methods.length}`);
    });

    if (args.values.parse) {
        console.log('\n📊 Детальная информация о сущностях:');
        entities.forEach((entity) => {
            console.log(`\n${entity.name}:`);
            entity.methods.forEach((method) => {
                console.log(`  - ${method.name} (${method.type})`);
            });
        });
        return;
    }

    // 2. Генерация
    if (args.values.all) {
        console.log('\n🚀 Генерация всех сущностей...\n');
        for (const entity of entities) {
            await generateEntityModule(entity, {
                update: args.values.update || false,
                force: args.values.force || false,
                dryRun: args.values.dry || false,
            });
        }
        
        // Генерируем summary после генерации всех модулей
        if (!args.values.dry) {
            console.log('\n📋 Генерация summary для навигации...\n');
            const summary = generateEntitySummary(entities);
            saveEntitySummary(summary);
        }
    } else if (args.values.entity) {
        const entity = entities.find((e) => e.name === args.values.entity);
        if (!entity) {
            console.log(`❌ Сущность "${args.values.entity}" не найдена`);
            return;
        }
        console.log(`\n🚀 Генерация модуля для "${entity.name}"...\n`);
        await generateEntityModule(entity, {
            update: args.values.update || false,
            force: args.values.force || false,
            dryRun: args.values.dry || false,
        });
    } else {
        console.log('\n💡 Использование:');
        console.log('  --parse              - только парсинг и вывод информации');
        console.log('  --entity=<name>      - сгенерировать конкретную сущность');
        console.log('  --all                - сгенерировать все сущности');
        console.log('  --update             - обновить существующий модуль (только отсутствующие части)');
        console.log('  --force              - перезаписать существующий модуль');
        console.log('  --dry                - dry-run режим (без записи файлов)');
    }
}

main().catch(console.error);

