import { glob } from 'glob';
import { readFileSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface EntityMethod {
    name: string;
    type: 'create' | 'read' | 'update' | 'delete' | 'list' | 'custom';
    dto?: string;
    params?: string;
    response?: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

export interface AdminEntity {
    name: string; // client, bitrix-app
    apiPrefix: string; // adminClient, adminBitrixApp
    folderName: string; // admin-client-management
    filePath: string;
    methods: EntityMethod[];
    dtoTypes: {
        create?: string;
        update?: string;
        response?: string;
        params?: string[];
    };
    // Определяем родительскую сущность по URL
    parentEntity?: string; // portal (если URL содержит /portals/)
    // Базовый URL для определения вложенности
    baseUrl?: string; // /api/admin/portals или /api/admin
}

/**
 * Обнаруживает все admin сущности в generated папке
 * Паттерн: admin-*-management
 * Путь: из apps/admin/scripts/... -> front/packages/nest-api/src/generated
 */
export async function discoverAdminEntities(): Promise<AdminEntity[]> {
    // Из apps/admin/scripts/generate-admin-entities/parsers/
    // Поднимаемся до front/ и идем в packages/nest-api/src/generated
    // Путь: apps/admin/scripts/.../parsers/ -> ../../../../ -> front/ -> packages/nest-api/...
    const generatedPath = join(
        __dirname,
        '../../../../../packages/nest-api/src/generated',
    );

    // Ищем все папки с паттерном admin-*-management
    // Используем относительный паттерн с cwd для правильной работы glob
    const pattern = 'admin-*-management';
    const matches = await glob(pattern, { cwd: generatedPath, absolute: true });

    // Фильтруем только директории
    const folders = matches.filter((path) => {
        try {
            return statSync(path).isDirectory();
        } catch {
            return false;
        }
    });

    const entities: AdminEntity[] = [];

    for (const folder of folders) {
        const entity = await parseAdminEntityFolder(folder);
        if (entity) {
            entities.push(entity);
        }
    }

    return entities;
}

/**
 * Парсит папку admin-*-management и извлекает информацию о сущности
 */
async function parseAdminEntityFolder(
    folderPath: string,
): Promise<AdminEntity | null> {
    const folderName = basename(folderPath);
    const tsFile = join(folderPath, `${folderName}.ts`);

    try {
        const content = readFileSync(tsFile, 'utf-8');

        // Извлекаем имя сущности из папки: admin-client-management -> client
        const entityNameMatch = folderName.match(/^admin-(.+)-management$/);
        if (!entityNameMatch || !entityNameMatch[1]) {
            return null;
        }
        const entityName = entityNameMatch[1];

        // Извлекаем API prefix: getAdminClientManagement -> adminClient
        const apiPrefixMatch = content.match(
            /export const get(Admin\w+Management)/,
        );
        if (!apiPrefixMatch || !apiPrefixMatch[1]) {
            return null;
        }
        const apiPrefix = apiPrefixMatch[1].replace(/^Admin/, '');

        // Парсим методы
        const methods = parseMethods(content);

        // Парсим DTO типы
        const dtoTypes = parseDtoTypes(content);

        // Определяем родительскую сущность и базовый URL по первому методу
        const firstMethod = methods[0];
        let parentEntity: string | undefined;
        let baseUrl: string | undefined;

        if (firstMethod?.url) {
            // Парсим URL: /api/admin/portals/portal-contracts -> parent: portal
            // Паттерн: /api/admin/{parent}/{child} или /api/admin/{parent}/{child}/{id}
            const urlMatch = firstMethod.url.match(/\/api\/admin\/(\w+)\/([\w-]+)/);
            if (urlMatch && urlMatch[1] && urlMatch[2]) {
                const urlParent = urlMatch[1]; // portals (множественное число)
                const childPath = urlMatch[2]; // portal-contracts
                
                // Преобразуем множественное число в единственное для сравнения
                const parentSingular = urlParent.endsWith('s') 
                    ? urlParent.slice(0, -1) 
                    : urlParent;
                
                // Если имя сущности содержит имя родителя в единственном числе
                // portal-contracts содержит "portal"
                // portal-measures содержит "portal"
                if (
                    entityName.includes(parentSingular) &&
                    entityName !== parentSingular &&
                    childPath.includes(parentSingular)
                ) {
                    parentEntity = parentSingular;
                    baseUrl = `/api/admin/${urlParent}`;
                } else {
                    baseUrl = `/api/admin`;
                }
            } else {
                // Простой паттерн: /api/admin/{entity}
                baseUrl = `/api/admin`;
            }
        }

        return {
            name: entityName,
            apiPrefix: apiPrefix.charAt(0).toLowerCase() + apiPrefix.slice(1),
            folderName,
            filePath: tsFile,
            methods,
            dtoTypes,
            parentEntity,
            baseUrl,
        };
    } catch (error) {
        console.error(`Ошибка при парсинге ${folderPath}:`, error);
        return null;
    }
}

/**
 * Парсит методы из файла
 */
function parseMethods(content: string): EntityMethod[] {
    const methods: EntityMethod[] = [];

    // Извлекаем содержимое функции getAdmin*Management
    const functionMatch = content.match(
        /export const getAdmin\w+Management\s*=\s*\(\)\s*=>\s*\{([\s\S]*?)\n\};/,
    );
    if (!functionMatch || !functionMatch[1]) {
        return methods;
    }
    const functionContent = functionMatch[1];

    // Паттерн для методов:
    // 1. С префиксом admin: const adminClientCreateClient = ...
    // 2. Без префикса admin: const contractCreateContract = ...
    const methodRegex =
        /const\s+((?:admin)?\w+)\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?url:\s*['"`]([^'"`]+)['"`][\s\S]*?method:\s*['"`](GET|POST|PUT|DELETE|PATCH)['"`]/g;

    let match;
    while ((match = methodRegex.exec(functionContent)) !== null) {
        const methodName = match[1];
        const url = match[2];
        const httpMethod = match[3] as EntityMethod['method'] | undefined;

        // Проверяем, что все значения определены
        if (!methodName || !url || !httpMethod) {
            continue;
        }

        // Определяем тип метода по имени
        const type = detectMethodType(methodName, httpMethod);

        // Извлекаем DTO и response типы
        const methodContent = extractMethodContent(functionContent, methodName);
        const dto = extractDtoType(methodContent);
        const response = extractResponseType(methodContent);
        const params = extractParamsType(methodContent);

        methods.push({
            name: methodName,
            type,
            dto,
            params,
            response,
            url,
            method: httpMethod,
        });
    }

    return methods;
}

/**
 * Определяет тип метода по имени и HTTP методу
 */
function detectMethodType(
    methodName: string,
    httpMethod: string,
): EntityMethod['type'] {
    const lowerName = methodName.toLowerCase();

    if (lowerName.includes('create') || lowerName.includes('store')) {
        return 'create';
    }
    if (lowerName.includes('update') || lowerName.includes('put')) {
        return 'update';
    }
    if (lowerName.includes('delete') || lowerName.includes('remove')) {
        return 'delete';
    }
    if (
        lowerName.includes('getall') ||
        lowerName.includes('list') ||
        lowerName.includes('findall')
    ) {
        return 'list';
    }
    if (lowerName.includes('get') || lowerName.includes('find')) {
        return 'read';
    }

    return 'custom';
}

/**
 * Извлекает содержимое метода
 */
function extractMethodContent(content: string, methodName: string): string {
    const regex = new RegExp(
        `const\\s+${methodName}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*\\{([\\s\\S]*?)\\n\\s*\\};`,
    );
    const match = content.match(regex);
    return match ? match[1] || '' : '';
}

/**
 * Извлекает тип DTO из метода
 */
function extractDtoType(methodContent: string): string | undefined {
    const match = methodContent.match(
        /(?:create|update|store)\w+Dto:\s*(\w+Dto)/i,
    );
    return match ? match[1] : undefined;
}

/**
 * Извлекает тип response из метода
 */
function extractResponseType(methodContent: string): string | undefined {
    const match = methodContent.match(/customAxios<(\w+)>/);
    return match ? match[1] : undefined;
}

/**
 * Извлекает тип params из метода
 */
function extractParamsType(methodContent: string): string | undefined {
    const match = methodContent.match(/params:\s*(\w+)/);
    return match ? match[1] : undefined;
}

/**
 * Парсит DTO типы из импортов
 */
function parseDtoTypes(content: string): AdminEntity['dtoTypes'] {
    const dtoTypes: AdminEntity['dtoTypes'] = {};

    // Ищем импорты DTO
    const importMatch = content.match(
        /import\s+type\s+\{([^}]+)\}\s+from\s+['"]\.\.\/\.\/model['"]/,
    );
    if (importMatch && importMatch[1]) {
        const imports = importMatch[1]
            .split(',')
            .map((i) => i.trim())
            .filter(Boolean);

        imports.forEach((imp) => {
            if (!imp) return;
            if (imp.includes('Create') && imp.includes('Dto')) {
                dtoTypes.create = imp;
            } else if (imp.includes('Update') && imp.includes('Dto')) {
                dtoTypes.update = imp;
            } else if (imp.includes('Response') && imp.includes('Dto')) {
                dtoTypes.response = imp;
            } else if (imp.includes('Params')) {
                if (!dtoTypes.params) {
                    dtoTypes.params = [];
                }
                dtoTypes.params.push(imp);
            }
        });
    }

    return dtoTypes;
}

