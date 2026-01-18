import { AdminEntity } from '../parsers/orval-parser';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface GenerateOptions {
    update?: boolean;
    force?: boolean;
    dryRun?: boolean;
}

/**
 * Преобразует имя сущности в PascalCase
 */
function toPascalCase(str: string): string {
    return str
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

/**
 * Преобразует имя сущности в camelCase
 */
function toCamelCase(str: string): string {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Преобразует имя сущности в kebab-case для URL
 */
function toKebabCase(str: string): string {
    return str.replace(/_/g, '-');
}

/**
 * Преобразует имя сущности во множественное число (простая версия)
 */
function toPlural(str: string): string {
    if (str.endsWith('y')) {
        return str.slice(0, -1) + 'ies';
    }
    if (str.endsWith('s') || str.endsWith('x') || str.endsWith('ch') || str.endsWith('sh')) {
        return str + 'es';
    }
    return str + 's';
}

/**
 * Проверяет существование модуля
 */
function checkModuleExists(entityName: string): {
    exists: boolean;
    modulePath: string;
    pagesPath: string;
} {
    const modulePath = join(
        __dirname,
        '../../../modules/entities',
        entityName,
    );

    const pagesPath = join(
        __dirname,
        '../../../app/(entities)',
        entityName,
    );

    const moduleExists = existsSync(modulePath);
    const pagesExist = existsSync(pagesPath);

    return {
        exists: moduleExists || pagesExist,
        modulePath,
        pagesPath,
    };
}

/**
 * Создает директорию, если её нет
 */
function ensureDir(dirPath: string) {
    if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Записывает файл, если его нет или если force=true
 */
function writeFileIfNotExists(
    filePath: string,
    content: string,
    force: boolean,
    update: boolean,
): boolean {
    const exists = existsSync(filePath);
    if (exists && !force && !update) {
        return false; // Пропускаем существующий файл
    }
    if (exists && update && !force) {
        return false; // В режиме update не перезаписываем существующие
    }
    writeFileSync(filePath, content, 'utf-8');
    return true;
}

/**
 * Извлекает базовое имя сущности из apiPrefix
 * contractsManagement -> Contract
 * clientManagement -> Client
 */
function extractBaseEntityName(apiPrefix: string): string {
    // Убираем "Management" в конце
    const withoutManagement = apiPrefix.replace(/Management$/, '');
    // Преобразуем в PascalCase и убираем множественное число
    const pascal = toPascalCase(withoutManagement);
    // Убираем 's' в конце если есть (простая версия)
    if (pascal.endsWith('s') && pascal.length > 1) {
        return pascal.slice(0, -1);
    }
    return pascal;
}

/**
 * Генерирует API helper
 */
function generateApiHelper(entity: AdminEntity): string {
    const entityPascal = toPascalCase(entity.name);
    const entityCamel = toCamelCase(entity.name);
    const baseEntityName = extractBaseEntityName(entity.apiPrefix);
    const baseEntityCamel = baseEntityName.charAt(0).toLowerCase() + baseEntityName.slice(1);
    const apiFunctionName = `getAdmin${entity.apiPrefix.charAt(0).toUpperCase() + entity.apiPrefix.slice(1)}`;
    
    // Находим методы для генерации
    const listMethod = entity.methods.find(m => m.type === 'list');
    const createMethod = entity.methods.find(m => m.type === 'create');
    const readMethod = entity.methods.find(m => m.type === 'read');
    const updateMethod = entity.methods.find(m => m.type === 'update');
    const deleteMethod = entity.methods.find(m => m.type === 'delete');

    const imports: string[] = [];
    const methods: string[] = [];

    // Используем реальные имена DTO из парсера
    const createDtoName = createMethod?.dto || entity.dtoTypes.create;
    const updateDtoName = updateMethod?.dto || entity.dtoTypes.update;
    const responseDtoName = entity.dtoTypes.response || `${baseEntityName}ResponseDto`;
    const paramsTypeName = listMethod?.params || (entity.dtoTypes.params?.[0]);

    // Генерируем импорты
    if (paramsTypeName && paramsTypeName !== '{}') {
        imports.push(paramsTypeName);
    }
    if (createDtoName) {
        imports.push(createDtoName);
    }
    if (updateDtoName) {
        imports.push(updateDtoName);
    }

    const importStatement = imports.length > 0
        ? `import { ${imports.join(', ')}, ${apiFunctionName} } from "@workspace/nest-api";`
        : `import { ${apiFunctionName} } from "@workspace/nest-api";`;

    // Генерируем методы
    if (listMethod) {
        const paramsType = paramsTypeName && paramsTypeName !== '{}' ? paramsTypeName : '{}';
        methods.push(`    async get${baseEntityName}s(dto: ${paramsType}) {
        const response = await this.api.${listMethod.name}(dto);
        return response;
    }`);
    }

    if (createMethod && createDtoName) {
        methods.push(`    async create${baseEntityName}(dto: ${createDtoName}) {
        const response = await this.api.${createMethod.name}(dto);
        return response;
    }`);
    }

    if (updateMethod && updateDtoName) {
        methods.push(`    async update${baseEntityName}(id: number, dto: ${updateDtoName}) {
        const response = await this.api.${updateMethod.name}(id, dto);
        return response;
    }`);
    }

    if (deleteMethod) {
        methods.push(`    async delete${baseEntityName}(id: number) {
        const response = await this.api.${deleteMethod.name}(id);
        return response;
    }`);
    }

    if (readMethod) {
        methods.push(`    async get${baseEntityName}ById(id: number) {
        const response = await this.api.${readMethod.name}(id);
        return response;
    }`);
    }

    return `${importStatement}

export class ${baseEntityName}Helper {
    private api: ReturnType<typeof ${apiFunctionName}>;
    constructor() {
        this.api = ${apiFunctionName}();
    }

${methods.join('\n\n')}

}
`;
}

/**
 * Генерирует TanStack Query hooks
 */
function generateHooks(entity: AdminEntity): string {
    const entityPascal = toPascalCase(entity.name);
    const entityCamel = toCamelCase(entity.name);
    const baseEntityName = extractBaseEntityName(entity.apiPrefix);
    const baseEntityCamel = baseEntityName.charAt(0).toLowerCase() + baseEntityName.slice(1);
    const baseEntityPlural = toPlural(baseEntityCamel);

    const listMethod = entity.methods.find(m => m.type === 'list');
    const createMethod = entity.methods.find(m => m.type === 'create');
    const readMethod = entity.methods.find(m => m.type === 'read');
    const updateMethod = entity.methods.find(m => m.type === 'update');
    const deleteMethod = entity.methods.find(m => m.type === 'delete');

    // Используем реальные имена DTO из парсера
    const createDtoName = createMethod?.dto || entity.dtoTypes.create;
    const updateDtoName = updateMethod?.dto || entity.dtoTypes.update;
    const responseDtoName = entity.dtoTypes.response || `${baseEntityName}ResponseDto`;
    const paramsTypeName = listMethod?.params || (entity.dtoTypes.params?.[0]);

    const imports: string[] = [];
    
    if (paramsTypeName && paramsTypeName !== '{}') {
        imports.push(paramsTypeName);
    }
    imports.push(responseDtoName);
    if (createDtoName) {
        imports.push(createDtoName);
    }
    if (updateDtoName) {
        imports.push(updateDtoName);
    }

    const hooks: string[] = [];

    if (listMethod) {
        const paramsType = paramsTypeName && paramsTypeName !== '{}' ? paramsTypeName : '{}';
        // Если paramsType не пустой объект, используем Partial<> для опциональных params
        // чтобы избежать проблем с обязательными полями при params || {}
        const paramsTypeForHook = paramsType === '{}' 
            ? '{}' 
            : `Partial<${paramsType}>`;
        const paramsDefault = paramsType === '{}' 
            ? 'params || {}' 
            : 'params || ({} as Partial<' + paramsType + '>)';
        const paramsCondition = paramsType === '{}' ? '' : 'enabled: !!params,';
        
        hooks.push(`export const use${baseEntityName}s = (params?: ${paramsTypeForHook}) => {
    return useQuery<${responseDtoName}[], Error>({
        queryKey: ['${baseEntityPlural}', params],
        queryFn: async () => {
            const response = await ${baseEntityCamel}Helper.get${baseEntityName}s(
                ${paramsDefault} as ${paramsType},
            );
            return response;
        },
        ${paramsCondition}
    });
};`);
    }

    if (readMethod) {
        hooks.push(`export const use${baseEntityName} = (id: number) => {
    return useQuery<${responseDtoName}, Error>({
        queryKey: ['${baseEntityCamel}', id],
        queryFn: async () => {
            const response = await ${baseEntityCamel}Helper.get${baseEntityName}ById(id);
            return response;
        },
        enabled: !!id,
    });
};`);
    }

    if (createMethod && createDtoName) {
        hooks.push(`export const useCreate${baseEntityName} = () => {
    const queryClient = useQueryClient();

    return useMutation<${responseDtoName}, Error, ${createDtoName}>({
        mutationFn: async (dto: ${createDtoName}) => {
            const response = await ${baseEntityCamel}Helper.create${baseEntityName}(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['${baseEntityPlural}'] });
        },
    });
};`);
    }

    if (updateMethod && updateDtoName) {
        hooks.push(`export const useUpdate${baseEntityName} = () => {
    const queryClient = useQueryClient();

    return useMutation<
        ${responseDtoName},
        Error,
        { id: number; dto: ${updateDtoName} }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await ${baseEntityCamel}Helper.update${baseEntityName}(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['${baseEntityPlural}'] });
            queryClient.invalidateQueries({
                queryKey: ['${baseEntityCamel}', variables.id],
            });
        },
    });
};`);
    }

    if (deleteMethod) {
        hooks.push(`export const useDelete${baseEntityName} = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await ${baseEntityCamel}Helper.delete${baseEntityName}(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['${baseEntityPlural}'] });
        },
    });
};`);
    }

    return `'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ${imports.join(',\n    ')}
} from '@workspace/nest-api';
import { ${baseEntityName}Helper } from '../api/${entityCamel}-helper';

const ${baseEntityCamel}Helper = new ${baseEntityName}Helper();

${hooks.join('\n\n')}

`;
}

/**
 * Генерирует FSD модуль для сущности
 */
export async function generateEntityModule(
    entity: AdminEntity,
    options: GenerateOptions = {},
): Promise<void> {
    const { update = false, force = false, dryRun = false } = options;

    console.log(`\n📦 Генерация модуля для "${entity.name}"...`);

    // Проверяем существование
    const { exists, modulePath, pagesPath } = checkModuleExists(entity.name);

    if (exists && !force && !update) {
        console.log(`  ⚠️  Модуль "${entity.name}" уже существует!`);
        console.log(`     - Модуль: ${modulePath}`);
        console.log(`     - Страницы: ${pagesPath}`);
        console.log(`\n  💡 Используйте:`);
        console.log(`     --force   - перезаписать существующий модуль`);
        console.log(`     --update  - обновить только отсутствующие части`);
        console.log(`     --dry     - показать что будет сгенерировано`);
        return;
    }

    if (exists && force) {
        console.log(`  ⚠️  ВНИМАНИЕ: Модуль будет перезаписан!`);
    }

    if (exists && update) {
        console.log(`  🔄 Обновление существующего модуля...`);
    }

    if (dryRun) {
        console.log('  [DRY RUN] Файлы не будут созданы');
        console.log(`  - Модуль: modules/entities/${entity.name}/`);
        console.log(`  - Страницы: app/(entities)/${entity.name}/`);
        if (exists) {
            console.log(`  ⚠️  Существующие файлы будут затронуты`);
        }
        return;
    }

    const entityPascal = toPascalCase(entity.name);
    const entityCamel = toCamelCase(entity.name);
    const entityPlural = toPlural(entityCamel);
    const entityKebab = toKebabCase(entity.name);

    // Создаем структуру директорий
    ensureDir(modulePath);
    ensureDir(join(modulePath, 'lib'));
    ensureDir(join(modulePath, 'lib', 'api'));
    ensureDir(join(modulePath, 'lib', 'hooks'));
    ensureDir(join(modulePath, 'model'));
    ensureDir(join(modulePath, 'ui'));
    ensureDir(join(modulePath, 'ui', `${entityCamel}-table`));
    ensureDir(join(modulePath, 'ui', `${entityCamel}-card`));
    ensureDir(join(modulePath, 'ui', `${entityCamel}-form`));
    ensureDir(join(modulePath, 'features'));
    ensureDir(join(modulePath, 'features', `${entityCamel}-list`));

    // Генерируем API helper
    const apiHelperPath = join(modulePath, 'lib', 'api', `${entityCamel}-helper.ts`);
    const apiHelperContent = generateApiHelper(entity);
    if (writeFileIfNotExists(apiHelperPath, apiHelperContent, force, update)) {
        console.log(`  ✅ Создан: lib/api/${entityCamel}-helper.ts`);
    }

    // Генерируем hooks
    const hooksPath = join(modulePath, 'lib', 'hooks', `use-${entityCamel}.ts`);
    const hooksContent = generateHooks(entity);
    if (writeFileIfNotExists(hooksPath, hooksContent, force, update)) {
        console.log(`  ✅ Создан: lib/hooks/use-${entityCamel}.ts`);
    }

    // Генерируем index для hooks
    const hooksIndexPath = join(modulePath, 'lib', 'hooks', 'index.ts');
    const hooksIndexContent = `export * from './use-${entityCamel}';
`;
    if (writeFileIfNotExists(hooksIndexPath, hooksIndexContent, force, update)) {
        console.log(`  ✅ Создан: lib/hooks/index.ts`);
    }

    // Генерируем model/index.ts (экспортируем DTO напрямую)
    const modelIndexPath = join(modulePath, 'model', 'index.ts');
    const baseEntityName = extractBaseEntityName(entity.apiPrefix);
    const listMethod = entity.methods.find(m => m.type === 'list');
    const createMethod = entity.methods.find(m => m.type === 'create');
    const updateMethod = entity.methods.find(m => m.type === 'update');
    
    // Используем реальные имена DTO
    const createDtoName = createMethod?.dto || entity.dtoTypes.create;
    const updateDtoName = updateMethod?.dto || entity.dtoTypes.update;
    const responseDtoName = entity.dtoTypes.response || `${baseEntityName}ResponseDto`;
    const paramsTypeName = listMethod?.params || (entity.dtoTypes.params?.[0]);
    
    const exports: string[] = [responseDtoName];
    if (createDtoName) {
        exports.push(createDtoName);
    }
    if (updateDtoName) {
        exports.push(updateDtoName);
    }
    if (paramsTypeName && paramsTypeName !== '{}') {
        exports.push(paramsTypeName);
    }
    
    const modelIndexContent = `// Экспортируем DTO типы напрямую из @workspace/nest-api
export type {
    ${exports.join(',\n    ')}
} from '@workspace/nest-api';
`;
    if (writeFileIfNotExists(modelIndexPath, modelIndexContent, force, update)) {
        console.log(`  ✅ Создан: model/index.ts`);
    }

    // Генерируем главный index.ts
    const mainIndexPath = join(modulePath, 'index.ts');
    const mainIndexContent = `export * from './lib/hooks';
export * from './ui';
export * from './features/${entityCamel}-list';

`;
    if (writeFileIfNotExists(mainIndexPath, mainIndexContent, force, update)) {
        console.log(`  ✅ Создан: index.ts`);
    }

    // Генерируем UI компоненты
    await generateUIComponents(entity, modulePath, force, update);

    // Генерируем features компонент (список)
    await generateFeatures(entity, modulePath, force, update);

    // Генерируем Next.js страницы
    await generateNextPages(entity, pagesPath, force, update);

    console.log(`  ✅ Модуль "${entity.name}" готов`);
}

/**
 * Генерирует UI компоненты (таблица, карточка, форма)
 */
async function generateUIComponents(
    entity: AdminEntity,
    modulePath: string,
    force: boolean,
    update: boolean,
): Promise<void> {
    const entityCamel = toCamelCase(entity.name);
    const baseEntityName = extractBaseEntityName(entity.apiPrefix);
    const responseDtoName = entity.dtoTypes.response || `${baseEntityName}ResponseDto`;
    const createDtoName = entity.dtoTypes.create;
    const updateDtoName = entity.dtoTypes.update;

    // Генерируем таблицу
    const tablePath = join(modulePath, 'ui', `${entityCamel}-table`, `${baseEntityName}Table.tsx`);
    const tableContent = generateTableComponent(entity, baseEntityName, responseDtoName);
    if (writeFileIfNotExists(tablePath, tableContent, force, update)) {
        console.log(`  ✅ Создан: ui/${entityCamel}-table/${baseEntityName}Table.tsx`);
    }

    // Генерируем index для таблицы
    const tableIndexPath = join(modulePath, 'ui', `${entityCamel}-table`, 'index.ts');
    const tableIndexContent = `export * from './${baseEntityName}Table';
`;
    if (writeFileIfNotExists(tableIndexPath, tableIndexContent, force, update)) {
        console.log(`  ✅ Создан: ui/${entityCamel}-table/index.ts`);
    }

    // Генерируем карточку
    const cardPath = join(modulePath, 'ui', `${entityCamel}-card`, `${baseEntityName}Card.tsx`);
    const cardContent = generateCardComponent(entity, baseEntityName, responseDtoName);
    if (writeFileIfNotExists(cardPath, cardContent, force, update)) {
        console.log(`  ✅ Создан: ui/${entityCamel}-card/${baseEntityName}Card.tsx`);
    }

    // Генерируем index для карточки
    const cardIndexPath = join(modulePath, 'ui', `${entityCamel}-card`, 'index.ts');
    const cardIndexContent = `export * from './${baseEntityName}Card';
`;
    if (writeFileIfNotExists(cardIndexPath, cardIndexContent, force, update)) {
        console.log(`  ✅ Создан: ui/${entityCamel}-card/index.ts`);
    }

    // Генерируем форму (если есть create или update DTO)
    if (createDtoName || updateDtoName) {
        const formPath = join(modulePath, 'ui', `${entityCamel}-form`, `${baseEntityName}Form.tsx`);
        const formContent = generateFormComponent(entity, baseEntityName, createDtoName, updateDtoName);
        if (writeFileIfNotExists(formPath, formContent, force, update)) {
            console.log(`  ✅ Создан: ui/${entityCamel}-form/${baseEntityName}Form.tsx`);
        }

        // Генерируем index для формы
        const formIndexPath = join(modulePath, 'ui', `${entityCamel}-form`, 'index.ts');
        const formIndexContent = `export * from './${baseEntityName}Form';
`;
        if (writeFileIfNotExists(formIndexPath, formIndexContent, force, update)) {
            console.log(`  ✅ Создан: ui/${entityCamel}-form/index.ts`);
        }
    }

    // Генерируем главный index для UI
    const uiIndexPath = join(modulePath, 'ui', 'index.ts');
    const uiIndexContent = `export * from './${entityCamel}-table';
export * from './${entityCamel}-card';
${createDtoName || updateDtoName ? `export * from './${entityCamel}-form';` : ''}
`;
    if (writeFileIfNotExists(uiIndexPath, uiIndexContent, force, update)) {
        console.log(`  ✅ Создан: ui/index.ts`);
    }
}

/**
 * Генерирует компонент таблицы
 */
function generateTableComponent(
    entity: AdminEntity,
    baseEntityName: string,
    responseDtoName: string,
): string {
    const entityCamel = toCamelCase(entity.name);
    const entityNamePlural = toPlural(entityCamel);

    return `'use client';

import * as React from 'react';
import { ${responseDtoName} } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface ${baseEntityName}TableProps {
    data: ${responseDtoName}[];
    isLoading?: boolean;
    onRowClick?: (item: ${responseDtoName}) => void;
    onEdit?: (item: ${responseDtoName}) => void;
    onDelete?: (item: ${responseDtoName}) => void;
}

export function ${baseEntityName}Table({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: ${baseEntityName}TableProps) {
    const columns: Column<${responseDtoName}>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей ${responseDtoName}
        {
            id: 'actions',
            header: 'Действия',
            cell: (row) => (
                <div className="flex gap-2">
                    {onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(row);
                            }}
                        >
                            Изменить
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(row);
                            }}
                        >
                            Удалить
                        </Button>
                    )}
                </div>
            ),
            className: 'w-48',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="${entityNamePlural} не найдены"
            onRowClick={onRowClick}
        />
    );
}
`;
}

/**
 * Генерирует компонент карточки
 */
function generateCardComponent(
    entity: AdminEntity,
    baseEntityName: string,
    responseDtoName: string,
): string {
    return `'use client';

import * as React from 'react';
import { ${responseDtoName} } from '@workspace/nest-api';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

interface ${baseEntityName}CardProps {
    item: ${responseDtoName};
    onEdit?: () => void;
    onDelete?: () => void;
    onViewDetails?: () => void;
}

export function ${baseEntityName}Card({
    item,
    onEdit,
    onDelete,
    onViewDetails,
}: ${baseEntityName}CardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">
                            {/* TODO: Замените на поле с именем/названием */}
                            ID: {item.id}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {/* TODO: Добавьте описание */}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-medium">{item.id}</span>
                    </div>
                    {/* TODO: Добавьте поля из ${responseDtoName} */}
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                {onViewDetails && (
                    <Button variant="outline" onClick={onViewDetails} className="flex-1">
                        Подробнее
                    </Button>
                )}
                {onEdit && (
                    <Button variant="outline" onClick={onEdit} className="flex-1">
                        Изменить
                    </Button>
                )}
                {onDelete && (
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        className="flex-1"
                    >
                        Удалить
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
`;
}

/**
 * Генерирует компонент формы
 */
function generateFormComponent(
    entity: AdminEntity,
    baseEntityName: string,
    createDtoName?: string,
    updateDtoName?: string,
): string {
    const dtoType = updateDtoName || createDtoName || 'any';

    return `'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { ${createDtoName || 'any'}, ${updateDtoName || 'any'} } from '@workspace/nest-api';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';

interface ${baseEntityName}FormProps {
    initialData?: ${updateDtoName || 'any'};
    onSubmit: (data: ${createDtoName || 'any'} | ${updateDtoName || 'any'}) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

export function ${baseEntityName}Form({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create',
}: ${baseEntityName}FormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<${createDtoName || 'any'} | ${updateDtoName || 'any'}>({
        defaultValues: initialData || {},
    });

    const onSubmitForm = (data: ${createDtoName || 'any'} | ${updateDtoName || 'any'}) => {
        onSubmit(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {mode === 'create' ? 'Создать ${baseEntityName.toLowerCase()}' : 'Редактировать ${baseEntityName.toLowerCase()}'}
                </CardTitle>
                <CardDescription>
                    {mode === 'create'
                        ? 'Заполните форму для создания нового ${baseEntityName.toLowerCase()}'
                        : 'Измените данные ${baseEntityName.toLowerCase()}'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmitForm)}>
                <CardContent className="space-y-4">
                    {/* TODO: Добавьте поля формы на основе ${createDtoName || updateDtoName || 'DTO'} */}
                    <div className="space-y-2">
                        <Label htmlFor="id">ID</Label>
                        <Input
                            id="id"
                            type="number"
                            {...register('id' as any)}
                            disabled={mode === 'edit'}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2 justify-end">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Отмена
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading
                            ? 'Сохранение...'
                            : mode === 'create'
                              ? 'Создать'
                              : 'Сохранить'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
`;
}

/**
 * Генерирует Next.js страницы для сущности
 */
async function generateNextPages(
    entity: AdminEntity,
    pagesPath: string,
    force: boolean,
    update: boolean,
): Promise<void> {
    const entityCamel = toCamelCase(entity.name);
    const baseEntityName = extractBaseEntityName(entity.apiPrefix);
    const responseDtoName = entity.dtoTypes.response || `${baseEntityName}ResponseDto`;
    const createDtoName = entity.dtoTypes.create;
    const updateDtoName = entity.dtoTypes.update;

    // Создаем директорию для страниц, если её нет
    ensureDir(pagesPath);

    // Главная страница списка
    const listPagePath = join(pagesPath, 'page.tsx');
    const listPageContent = `import { ${baseEntityName}List } from '@/modules/entities/${entityCamel}/features/${entityCamel}-list';

export default function ${baseEntityName}sPage() {
    return <${baseEntityName}List />;
}
`;
    if (writeFileIfNotExists(listPagePath, listPageContent, force, update)) {
        console.log(`  ✅ Создан: app/(entities)/${entity.name}/page.tsx`);
    }

    // Страница создания (если есть create метод)
    if (createDtoName) {
        const newPagePath = join(pagesPath, 'new', 'page.tsx');
        const newPageContent = `'use client';

import { useRouter } from 'next/navigation';
import { ${baseEntityName}Form } from '@/modules/entities/${entityCamel}/ui/${entityCamel}-form';
import { useCreate${baseEntityName} } from '@/modules/entities/${entityCamel}/lib/hooks';
import { ${createDtoName} } from '@workspace/nest-api';

export default function New${baseEntityName}Page() {
    const router = useRouter();
    const create${baseEntityName} = useCreate${baseEntityName}();

    const handleSubmit = (data: ${createDtoName}) => {
        create${baseEntityName}.mutate(data, {
            onSuccess: () => {
                router.push('/${entity.name}');
            },
        });
    };

    const handleCancel = () => {
        router.push('/${entity.name}');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <${baseEntityName}Form
                mode="create"
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={create${baseEntityName}.isPending}
            />
        </div>
    );
}
`;
        ensureDir(join(pagesPath, 'new'));
        if (writeFileIfNotExists(newPagePath, newPageContent, force, update)) {
            console.log(`  ✅ Создан: app/(entities)/${entity.name}/new/page.tsx`);
        }
    }

    // Страница деталей и редактирования (если есть read метод)
    const readMethod = entity.methods.find(m => m.type === 'read');
    if (readMethod) {
        ensureDir(join(pagesPath, '[id]'));
        
        // Страница деталей
        const detailPagePath = join(pagesPath, '[id]', 'page.tsx');
        const detailPageContent = `'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { use${baseEntityName} } from '@/modules/entities/${entityCamel}/lib/hooks';
import { ${baseEntityName}Card } from '@/modules/entities/${entityCamel}/ui/${entityCamel}-card';
import { Button } from '@workspace/ui/components/button';

export default function ${baseEntityName}DetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const ${entityCamel}Id = parseInt(id, 10);
    const { data: ${entityCamel}, isLoading } = use${baseEntityName}(${entityCamel}Id);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!${entityCamel}) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">${baseEntityName} не найден</h1>
                    <Button onClick={() => router.push('/${entity.name}')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/${entity.name}')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <${baseEntityName}Card
                item={${entityCamel}}
                onEdit={() => router.push(\`/${entity.name}/\${${entityCamel}.id}/edit\`)}
                onDelete={() => router.push(\`/${entity.name}/\${${entityCamel}.id}/delete\`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}
`;
        if (writeFileIfNotExists(detailPagePath, detailPageContent, force, update)) {
            console.log(`  ✅ Создан: app/(entities)/${entity.name}/[id]/page.tsx`);
        }

        // Страница редактирования (если есть update метод)
        if (updateDtoName) {
            ensureDir(join(pagesPath, '[id]', 'edit'));
            const editPagePath = join(pagesPath, '[id]', 'edit', 'page.tsx');
            const editPageContent = `'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { use${baseEntityName}, useUpdate${baseEntityName} } from '@/modules/entities/${entityCamel}/lib/hooks';
import { ${baseEntityName}Form } from '@/modules/entities/${entityCamel}/ui/${entityCamel}-form';
import { ${updateDtoName} } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function Edit${baseEntityName}Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const ${entityCamel}Id = parseInt(id, 10);
    const { data: ${entityCamel}, isLoading } = use${baseEntityName}(${entityCamel}Id);
    const update${baseEntityName} = useUpdate${baseEntityName}();

    const handleSubmit = (data: ${updateDtoName}) => {
        update${baseEntityName}.mutate(
            { id: ${entityCamel}Id, dto: data },
            {
                onSuccess: () => {
                    router.push(\`/${entity.name}/\${${entityCamel}Id}\`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(\`/${entity.name}/\${${entityCamel}Id}\`);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!${entityCamel}) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">${baseEntityName} не найден</h1>
                    <Button onClick={() => router.push('/${entity.name}')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <${baseEntityName}Form
                mode="edit"
                initialData={${entityCamel} as ${updateDtoName}}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={update${baseEntityName}.isPending}
            />
        </div>
    );
}
`;
            if (writeFileIfNotExists(editPagePath, editPageContent, force, update)) {
                console.log(`  ✅ Создан: app/(entities)/${entity.name}/[id]/edit/page.tsx`);
            }
        }
    }
}

/**
 * Генерирует features компонент (список)
 */
async function generateFeatures(
    entity: AdminEntity,
    modulePath: string,
    force: boolean,
    update: boolean,
): Promise<void> {
    const entityCamel = toCamelCase(entity.name);
    const baseEntityName = extractBaseEntityName(entity.apiPrefix);
    const entityNamePlural = toPlural(entityCamel);
    const responseDtoName = entity.dtoTypes.response || `${baseEntityName}ResponseDto`;
    const listMethod = entity.methods.find(m => m.type === 'list');
    const deleteMethod = entity.methods.find(m => m.type === 'delete');

    if (!listMethod) {
        return; // Нет метода списка, не генерируем
    }

    const listPath = join(modulePath, 'features', `${entityCamel}-list`, `${baseEntityName}List.tsx`);
    const listContent = `'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { use${baseEntityName}s${deleteMethod ? `, useDelete${baseEntityName}` : ''} } from '../../lib/hooks';
import { ${baseEntityName}Table } from '../../ui/${entityCamel}-table';
import { Button } from '@workspace/ui/components/button';
${deleteMethod ? `import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';` : ''}

export function ${baseEntityName}List() {
    const router = useRouter();
    const { data: ${entityNamePlural}, isLoading } = use${baseEntityName}s();
    ${deleteMethod ? `const delete${baseEntityName} = useDelete${baseEntityName}();` : ''}
    ${deleteMethod ? `const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);` : ''}
    ${deleteMethod ? `const [${entityCamel}ToDelete, set${baseEntityName}ToDelete] = React.useState<number | null>(null);` : ''}

    const handleRowClick = (${entityCamel}: ${responseDtoName}) => {
        router.push(\`/${entity.name}/\${${entityCamel}.id}\`);
    };

    const handleEdit = (${entityCamel}: ${responseDtoName}) => {
        router.push(\`/${entity.name}/\${${entityCamel}.id}/edit\`);
    };

    ${deleteMethod ? `const handleDelete = (${entityCamel}: ${responseDtoName}) => {
        set${baseEntityName}ToDelete(${entityCamel}.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (${entityCamel}ToDelete) {
            delete${baseEntityName}.mutate(${entityCamel}ToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    set${baseEntityName}ToDelete(null);
                },
            });
        }
    };` : ''}

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">${baseEntityName}s</h1>
                <Button onClick={() => router.push('/${entity.name}/new')}>
                    Создать ${baseEntityName.toLowerCase()}
                </Button>
            </div>

            <${baseEntityName}Table
                data={Array.isArray(${entityNamePlural}) ? ${entityNamePlural} : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                ${deleteMethod ? `onDelete={handleDelete}` : ''}
            />

            ${deleteMethod ? `<ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот ${baseEntityName.toLowerCase()}? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />` : ''}
        </div>
    );
}
`;
    
    ensureDir(join(modulePath, 'features', `${entityCamel}-list`));
    if (writeFileIfNotExists(listPath, listContent, force, update)) {
        console.log(`  ✅ Создан: features/${entityCamel}-list/${baseEntityName}List.tsx`);
    }

    // Генерируем index для features
    const listIndexPath = join(modulePath, 'features', `${entityCamel}-list`, 'index.ts');
    const listIndexContent = `export * from './${baseEntityName}List';
`;
    if (writeFileIfNotExists(listIndexPath, listIndexContent, force, update)) {
        console.log(`  ✅ Создан: features/${entityCamel}-list/index.ts`);
    }
}
