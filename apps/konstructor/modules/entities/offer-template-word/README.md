# Word Template Module

Модуль для работы с Word шаблонами через backAPI.

## Структура модуля

```
offer-template-word/
├── types/              # TypeScript типы
├── model/              # Redux thunks и reducer
├── hooks/              # React хуки для удобного использования
├── lib/                # Утилиты
└── index.ts            # Главный экспорт
```

## Архитектурные ответы по TODO

Ниже рекомендации по вопросам из `word-template-api.ts`:

1. **Как установить текущий используемый шаблон для пользователя**
   - Использовать сущность `user-selected-templates` как источник персональных настроек выбора.
   - При выборе шаблона в UI:
     - если запись отсутствует -> `createUserSelectedTemplateAPI(...)` с `is_current: true`;
     - если запись есть -> `setCurrentUserSelectedTemplateAPI({ id })`.
   - На бэке `setCurrent` должен сбрасывать `is_current = false` у других записей в рамках `(bitrix_user_id, portal_id)` и выставлять `true` только одной записи.
   - При инициализации экрана грузить:
     - шаблоны (`word-templates/*`);
     - выбор пользователя (`fetchUserSelectedTemplatesAPI({ bitrix_user_id, portal_id })`);
     - затем мержить по `offer_template_id`.

2. **Как установить текущий для сохраненной сделки**
   - Текущий шаблон сделки должен храниться отдельно от user preference.
   - Рекомендуемый вариант: в сущности сделки (или связанной таблице) добавить `offer_template_id` + snapshot-настроек.
   - Во время отправки/сохранения сделки:
     - передавать выбранный `offer_template_id`;
     - сохранять вычисленные настройки (цены/инфоблоки/тексты) как snapshot, чтобы документ был воспроизводим даже при изменении шаблонов.
   - При повторном открытии сделки приоритет выбора:
     1) шаблон из сделки;
     2) `is_current` пользователя;
     3) default шаблон портала/публичный.

3. **Как ограничить редактирование публичных и портальных шаблонов**
   - Правило доступа должно быть серверным (frontend только дублирует UX-блокировки).
   - Минимальная ACL-модель:
     - `PUBLIC`: редактировать/удалять может только `superuser`;
     - `PORTAL`: редактировать/удалять может создатель шаблона или админ портала;
     - `USER`: только создатель.
   - Для корректной проверки нужно хранить метаданные владельца:
     - `created_by_user_id`;
     - `created_by_portal_id`.
   - В API списка желательно вернуть флаги `can_edit`/`can_delete`, чтобы фронт не дублировал бизнес-логику ролей.

### Почему так
- Персональный выбор (`is_current`) и выбор для конкретной сделки - разные контексты, их нельзя хранить в одном флаге.
- Snapshot в сделке защищает от регрессий при изменении шаблонов.
- Авторизация на бэке исключает обход ограничений через прямые запросы.

## Установка

Модуль уже интегрирован в Redux store. Просто импортируйте нужные функции:

```typescript
import { useWordTemplate, createWordTemplate } from '@/modules/modules/offer-template-word';
```

## Использование

### С хуком useWordTemplate

```tsx
import { useWordTemplate } from '@/modules/modules/offer-template-word';
import { WordTemplateVisibility } from '@/modules/modules/offer-template-word/types';

function WordTemplateList() {
  const {
    templates,
    isLoading,
    error,
    fetchAll,
    create,
    update,
    remove,
  } = useWordTemplate();

  useEffect(() => {
    // Загрузить все шаблоны
    fetchAll({
      visibility: WordTemplateVisibility.PUBLIC,
      is_active: true
    });
  }, []);

  const handleCreate = async () => {
    try {
      await create({
        name: 'New Template',
        code: 'new-template',
        visibility: WordTemplateVisibility.PORTAL,
        file: selectedFile,
      });
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {templates.map(template => (
        <div key={template.id}>{template.name}</div>
      ))}
    </div>
  );
}
```

### Прямое использование thunks

```typescript
import { useAppDispatch } from '@/hooks/redux';
import {
  findAllWordTemplates,
  createWordTemplate,
  findWordTemplateById,
  updateWordTemplate,
  deleteWordTemplate,
} from '@/modules/modules/offer-template-word';

function MyComponent() {
  const dispatch = useAppDispatch();

  const loadTemplates = async () => {
    const templates = await dispatch(
      findAllWordTemplates({
        visibility: 'public',
        is_active: true
      })
    );
    console.log('Templates:', templates);
  };

  const createTemplate = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', 'My Template');
    formData.append('code', 'my-template');

    const template = await dispatch(
      createWordTemplate({
        name: 'My Template',
        code: 'my-template',
        file: file,
        visibility: 'private',
      })
    );
    console.log('Created:', template);
  };

  return <button onClick={loadTemplates}>Load Templates</button>;
}
```

## API Методы

### createWordTemplate
Создать новый шаблон с файлом.

```typescript
const template = await dispatch(createWordTemplate({
  name: string;
  code: string;
  file?: File;
  visibility?: WordTemplateVisibility;
  is_default?: boolean;
  tags?: string;
  is_active?: boolean;
  portal_id?: number;
  user_id?: number;
}));
```

### findAllWordTemplates
Получить все шаблоны с фильтрами.

```typescript
const templates = await dispatch(findAllWordTemplates({
  visibility?: WordTemplateVisibility;
  portal_id?: string | number;
  is_active?: boolean;
  search?: string;
}));
```

### findPublicWordTemplates
Получить публичные шаблоны.

```typescript
const templates = await dispatch(findPublicWordTemplates());
```

### findWordTemplatesByPortal
Получить шаблоны по порталу.

```typescript
const templates = await dispatch(findWordTemplatesByPortal({
  portal_id: string | number;
}));
```

### findUserWordTemplates
Получить шаблоны пользователя по порталу.

```typescript
const templates = await dispatch(findUserWordTemplates({
  user_id: string | number;
  portal_id: string | number;
}));
```

### findWordTemplateById
Получить шаблон по ID.

```typescript
const template = await dispatch(findWordTemplateById({
  id: string;
}));
```

### updateWordTemplate
Обновить шаблон.

```typescript
const template = await dispatch(updateWordTemplate(id, {
  name?: string;
  code?: string;
  file?: File;
  visibility?: WordTemplateVisibility;
  is_default?: boolean;
  tags?: string;
  is_active?: boolean;
  portal_id?: number;
  user_id?: number;
}));
```

### deleteWordTemplate
Удалить шаблон.

```typescript
await dispatch(deleteWordTemplate({
  id: string;
}));
```

### setWordTemplateActive
Установить активный статус.

```typescript
const template = await dispatch(setWordTemplateActive(id, is_active));
```

### setWordTemplateDefault
Установить шаблон как дефолтный.

```typescript
const template = await dispatch(setWordTemplateDefault(id, is_default));
```

## Утилиты

```typescript
import {
  filterTemplatesByVisibility,
  getDefaultTemplate,
  getActiveTemplates,
  searchTemplates,
  sortTemplatesByName,
  isPublicTemplate,
  groupTemplatesByVisibility,
} from '@/modules/modules/offer-template-word/lib';

// Фильтрация
const publicTemplates = filterTemplatesByVisibility(templates, 'public');
const activeTemplates = getActiveTemplates(templates);
const defaultTemplate = getDefaultTemplate(templates);

// Поиск
const found = searchTemplates(templates, 'search query');

// Сортировка
const sorted = sortTemplatesByName(templates, true);

// Группировка
const grouped = groupTemplatesByVisibility(templates);
```

## Redux State

```typescript
interface WordTemplateState {
  templates: WordTemplateSummary[];
  currentTemplate: WordTemplate | null;
  isLoading: boolean;
  isFetched: boolean;
  error: string | null;
}
```

Доступ через:
```typescript
const state = useAppSelector(state => state.wordTemplate);
```

## Типы

```typescript
import {
  WordTemplate,
  WordTemplateSummary,
  WordTemplateVisibility,
  CreateWordTemplateRequest,
  UpdateWordTemplateRequest,
} from '@/modules/modules/offer-template-word/types';
```

## Примеры

### Загрузка и отображение шаблонов

```tsx
function TemplateList() {
  const { templates, isLoading, fetchAll } = useWordTemplate();

  useEffect(() => {
    fetchAll({ is_active: true });
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {templates.map(template => (
        <li key={template.id}>
          <h3>{template.name}</h3>
          <p>Code: {template.code}</p>
          <p>Visibility: {template.visibility}</p>
          <p>Active: {template.is_active ? 'Yes' : 'No'}</p>
        </li>
      ))}
    </ul>
  );
}
```

### Создание шаблона с файлом

```tsx
function CreateTemplateForm() {
  const { create, isCreating } = useWordTemplate();
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      await create({
        name: 'My Template',
        code: 'my-template',
        file: file,
        visibility: 'private',
        is_active: true,
      });
      alert('Template created!');
    } catch (error) {
      alert('Failed to create template');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept=".docx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button type="submit" disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create Template'}
      </button>
    </form>
  );
}
```

