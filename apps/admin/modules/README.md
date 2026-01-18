# Admin Modules - FSD Architecture

Этот проект использует архитектуру Feature-Sliced Design (FSD) для организации кода.

## Структура модулей

### Entities (Сущности)

#### Client (`modules/entities/client`)
Модуль для управления клиентами с полным CRUD функционалом.

**Структура:**
- `model/` - типы, константы, хелперы
- `lib/` - API helpers и hooks (tanstack query)
- `ui/` - UI компоненты (таблица, карточка, форма)
- `features/` - сложные фичи (список клиентов)

**Hooks:**
- `useClients()` - получение списка клиентов
- `useClient(id)` - получение клиента по ID
- `useCreateClient()` - создание клиента
- `useUpdateClient()` - обновление клиента
- `useDeleteClient()` - удаление клиента
- `useClientByEmail(email)` - поиск по email

**Страницы:**
- `/admin/clients` - список клиентов
- `/admin/clients/new` - создание клиента
- `/admin/clients/[id]` - детали клиента
- `/admin/clients/[id]/edit` - редактирование клиента

#### Bitrix App (`modules/entities/bitrix-app`)
Модуль для управления Bitrix приложениями.

**Структура:**
- `model/` - типы
- `lib/` - API helpers и hooks
- `ui/` - UI компоненты
- `features/` - сложные фичи

**Hooks:**
- `useBitrixApps()` - получение всех приложений
- `useBitrixApp(params)` - получение приложения
- `useBitrixAppsByPortal(domain)` - приложения по домену
- `useBitrixAppsByPortalId(portalId)` - приложения по ID портала
- `useEnabledBitrixApps()` - включенные приложения
- `useStoreOrUpdateBitrixApp()` - создание/обновление
- `useUpdateBitrixApp()` - обновление
- `useDeleteBitrixApp()` - удаление

**Страницы:**
- `/admin/bitrix-apps` - список приложений

### Shared (Общие компоненты)

#### UI Components (`modules/shared/ui`)
Переиспользуемые UI компоненты:
- `DataTable` - универсальная таблица данных
- `ConfirmDialog` - диалог подтверждения

## Использование

### Пример использования hooks

```tsx
import { useClients, useCreateClient } from '@/modules/entities/client';

function MyComponent() {
    const { data: clients, isLoading } = useClients();
    const createClient = useCreateClient();

    const handleCreate = () => {
        createClient.mutate({
            name: 'New Client',
            email: 'client@example.com',
            status: 'active',
            is_active: true,
        });
    };

    return (
        <div>
            {isLoading ? 'Loading...' : clients?.map(client => (
                <div key={client.id}>{client.name}</div>
            ))}
        </div>
    );
}
```

### Пример использования UI компонентов

```tsx
import { ClientTable } from '@/modules/entities/client/ui';
import { DataTable } from '@/modules/shared/ui';

function ClientsPage() {
    return <ClientTable data={clients} onRowClick={handleClick} />;
}
```

## Технологии

- **Next.js 15** - React framework
- **TanStack Query** - управление состоянием сервера
- **React Hook Form** - управление формами
- **Shadcn UI** - UI компоненты
- **TypeScript** - типизация
- **Orval** - генерация API клиентов

## Архитектурные принципы

1. **Разделение ответственности** - каждый слой имеет четкую роль
2. **Переиспользование** - общие компоненты в shared
3. **Типизация** - полная типизация TypeScript
4. **Изоляция** - модули независимы друг от друга
5. **Масштабируемость** - легко добавлять новые сущности

