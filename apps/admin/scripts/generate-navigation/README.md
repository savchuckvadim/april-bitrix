# Генератор навигации

Отдельный скрипт для генерации `allEntities` из `entity-summary.ts`.

## Описание

Этот скрипт читает автоматически сгенерированный файл `entity-summary.ts` и создает массив `allEntities` для использования в навигации (Sidebar).

## Использование

```bash
pnpm generate:navigation
```

## Что делает скрипт

1. Читает `modules/entities/entity-summary.ts`
2. Извлекает информацию о всех сущностях
3. Генерирует `app/lib/initial-entities.ts` с массивом `allEntities`
4. Автоматически:
   - Присваивает уникальные ID каждой сущности
   - Создает множественное число для `items`
   - Определяет `relations` на основе `parent`/`children`
   - Преобразует `route` в `url`

## Формат данных

Скрипт генерирует массив объектов типа `Entity`:

```typescript
{
    id: number;
    item: {
        name: string;
        title: string;
        type: ENTITY_QUANTITY.ENTITY;
        get: {
            url: string;
            method: API_METHOD.GET;
        };
    };
    items: {
        name: string; // множественное число
        title: string; // множественное число
        type: ENTITY_QUANTITY.ENTITIES;
        get: {
            url: string;
            method: API_METHOD.GET;
        };
    };
    relations: number[]; // ID дочерних сущностей
}
```

## Зависимости

- `entity-summary.ts` должен быть сгенерирован через `pnpm generate:admin-entities --all`
- Скрипт полностью независим от других генераторов

## Примечания

- Генерируются только корневые сущности (без `parent`)
- Дочерние сущности получают ID для использования в `relations`
- Слова, уже во множественном числе (например, `timezones`, `smarts`), остаются без изменений

