import { LeadsFlowDef } from './types';

/** Обзорная схема: четыре фазы процесса (горизонтальная). */
const OVERVIEW_FLOW: LeadsFlowDef = {
    id: 'overview',
    height: 320,
    caption:
        'Менеджер занят только фазой опознания — и работает там той же формой «Звонки», что и в сделках. Остальные фазы — автоматика. Пунктир — путь мусора: закрытие без следов в учёте.',
    nodes: [
        { id: 'start', kind: 'event', position: { x: 0, y: 90 }, data: { label: 'Лид создан', tone: 'start', horizontal: true } },
        { id: 'f1', kind: 'task', position: { x: 170, y: 80 }, data: { label: 'Фаза 1 · Приём', sub: 'классификация источника', actor: 'sys', horizontal: true } },
        { id: 'f2', kind: 'task', position: { x: 430, y: 80 }, data: { label: 'Фаза 2 · Дубли', sub: 'телефон + email + ИНН', actor: 'sys', horizontal: true } },
        { id: 'f3', kind: 'task', position: { x: 690, y: 80 }, data: { label: 'Фаза 3 · Опознание', sub: 'менеджер + руководитель', actor: 'mgr', horizontal: true } },
        { id: 'f4', kind: 'task', position: { x: 950, y: 80 }, data: { label: 'Фаза 4 · Финал', sub: 'привязка и конвертация', actor: 'sys', horizontal: true } },
        { id: 'done', kind: 'event', position: { x: 1220, y: 90 }, data: { label: 'Компания + сделка', tone: 'done', horizontal: true } },
        { id: 'junk', kind: 'event', position: { x: 470, y: 230 }, data: { label: 'lead_junk', tone: 'junk', horizontal: true } },
    ],
    edges: [
        { source: 'start', target: 'f1' },
        { source: 'f1', target: 'f2' },
        { source: 'f2', target: 'f3' },
        { source: 'f3', target: 'f4' },
        { source: 'f4', target: 'done' },
        { source: 'f1', target: 'junk', label: 'мусор / не ЦА', dashed: true },
        { source: 'f3', target: 'junk', label: 'тупик', dashed: true },
    ],
};

/** Полный BPMN-процесс профиля A (вертикальная). */
const MAIN_FLOW: LeadsFlowDef = {
    id: 'main',
    height: 980,
    caption:
        'Эталонный workflow профиля A «Лид-минимум». В лиде разрешены звонки и выяснение компании; КП, счета и оплата — только по сделке.',
    nodes: [
        { id: 'start', kind: 'event', position: { x: 470, y: 0 }, data: { label: 'Лид создан', tone: 'start' } },
        { id: 'cls', kind: 'gateway', position: { x: 460, y: 110 }, data: { label: 'Класс лида?' } },
        { id: 'junk1', kind: 'event', position: { x: 850, y: 115 }, data: { label: 'lead_junk', tone: 'junk' } },
        { id: 'quar', kind: 'task', position: { x: 60, y: 110 }, data: { label: 'Карантин импорта', sub: 'выпуск порциями — решает РОП', actor: 'rop', tone: 'warn' } },
        { id: 'dedup', kind: 'task', position: { x: 380, y: 230 }, data: { label: 'Проверка на дубли', sub: 'телефон + email + ИНН, по лидам, контактам, компаниям', actor: 'sys' } },
        { id: 'out', kind: 'gateway', position: { x: 460, y: 350 }, data: { label: 'Исход поиска?' } },
        { id: 'new', kind: 'task', position: { x: 80, y: 460 }, data: { label: 'Новая компания?', sub: 'менеджер выясняет название и ИНН', actor: 'mgr' } },
        { id: 'one', kind: 'task', position: { x: 380, y: 460 }, data: { label: 'Похоже, знакомая', sub: 'карточка совпадения в ленте лида', actor: 'mgr' } },
        { id: 'many', kind: 'task', position: { x: 680, y: 460 }, data: { label: 'Требует решения', sub: 'карточка выбора у РОП', actor: 'rop', tone: 'warn' } },
        { id: 'call', kind: 'task', position: { x: 230, y: 580 }, data: { label: 'Звонок из карточки лида', sub: 'вкладка «Звонки», та же форма · событие KPI', actor: 'mgr' } },
        { id: 'id', kind: 'gateway', position: { x: 310, y: 700 }, data: { label: 'Компания опознана?' } },
        { id: 'junk2', kind: 'event', position: { x: 700, y: 705 }, data: { label: 'lead_junk', tone: 'junk' } },
        { id: 'bind', kind: 'task', position: { x: 60, y: 810 }, data: { label: 'Привязка к существующей', sub: 'дубли — только ручное слияние', actor: 'sys' } },
        { id: 'create', kind: 'task', position: { x: 420, y: 810 }, data: { label: 'Создание компании из лида', actor: 'sys' } },
        { id: 'live', kind: 'gateway', position: { x: 120, y: 905 }, data: { label: 'Есть живая сделка?' } },
        { id: 'conv', kind: 'task', position: { x: 420, y: 905 }, data: { label: 'Конвертация', sub: 'лид → CONVERTED · сделка «Новая» → скрипт двигает по источнику', actor: 'sys' } },
        { id: 'att', kind: 'task', position: { x: 60, y: 1010 }, data: { label: 'Заявка — к сделке', sub: 'лишняя сделка → «Дубль» · уведомить ответственного', actor: 'sys' } },
        { id: 'done', kind: 'event', position: { x: 480, y: 1035 }, data: { label: 'Контур компания + сделка', tone: 'done' } },
    ],
    edges: [
        { source: 'start', target: 'cls' },
        { source: 'cls', target: 'junk1', label: 'мусор / не ЦА', dashed: true },
        { source: 'cls', target: 'quar', label: 'импорт' },
        { source: 'cls', target: 'dedup', label: 'наш ОП' },
        { source: 'quar', target: 'dedup', label: 'порция в работу' },
        { source: 'dedup', target: 'out' },
        { source: 'out', target: 'new', label: '0 совпадений' },
        { source: 'out', target: 'one', label: '1 компания / контакт' },
        { source: 'out', target: 'many', label: 'несколько' },
        { source: 'many', target: 'one', label: 'та компания' },
        { source: 'many', target: 'new', label: 'разные' },
        { source: 'many', target: 'junk2', label: 'мусор', dashed: true },
        { source: 'new', target: 'call' },
        { source: 'one', target: 'call' },
        { source: 'call', target: 'id' },
        { source: 'id', target: 'call', label: 'контакт целевой — следующий звонок' },
        { source: 'id', target: 'junk2', label: 'тупик', dashed: true },
        { source: 'id', target: 'bind', label: 'найдена в CRM' },
        { source: 'id', target: 'create', label: 'новая' },
        { source: 'bind', target: 'live' },
        { source: 'live', target: 'att', label: 'да' },
        { source: 'live', target: 'conv', label: 'нет' },
        { source: 'create', target: 'conv' },
        { source: 'att', target: 'done' },
        { source: 'conv', target: 'done' },
    ],
};

/** Конвейер проверки на дубли (горизонтальная). */
const DEDUP_FLOW: LeadsFlowDef = {
    id: 'dedup',
    height: 420,
    caption:
        'Три пусковых механизма — одна точка обработки, логика не дублируется. ИНН — самый сильный сигнал; телефон и email — косвенные; финальное решение всегда за человеком.',
    nodes: [
        { id: 't1', kind: 'task', position: { x: 0, y: 0 }, data: { label: 'Создание лида', sub: 'событие ONCRMLEADADD', actor: 'sys', horizontal: true } },
        { id: 't2', kind: 'task', position: { x: 0, y: 110 }, data: { label: 'Робот на стадии', sub: 'вебхук', actor: 'sys', horizontal: true } },
        { id: 't3', kind: 'task', position: { x: 0, y: 220 }, data: { label: 'Кнопка в «Звонках»', sub: 'менеджер узнал ИНН', actor: 'mgr', horizontal: true } },
        { id: 'ep', kind: 'task', position: { x: 300, y: 110 }, data: { label: 'Единая точка проверки', actor: 'sys', horizontal: true } },
        { id: 'norm', kind: 'task', position: { x: 560, y: 110 }, data: { label: 'Нормализация', sub: 'телефоны к единому формату, email к нижнему регистру', actor: 'sys', horizontal: true } },
        { id: 'find', kind: 'task', position: { x: 830, y: 110 }, data: { label: 'Точные совпадения', sub: 'по лидам, контактам, компаниям', actor: 'sys', horizontal: true } },
        { id: 'inn', kind: 'task', position: { x: 1100, y: 110 }, data: { label: 'Поиск по ИНН', sub: 'реквизиты компаний', actor: 'sys', horizontal: true } },
        { id: 'enrich', kind: 'task', position: { x: 1370, y: 110 }, data: { label: 'Обогащение', sub: 'открытые сделки · ответственные', actor: 'sys', horizontal: true } },
        { id: 'res', kind: 'task', position: { x: 1640, y: 110 }, data: { label: 'Карточка результата', sub: 'лента лида + кнопки «Это она» / «Не она» / «Эскалировать»', actor: 'sys', horizontal: true } },
    ],
    edges: [
        { source: 't1', target: 'ep' },
        { source: 't2', target: 'ep' },
        { source: 't3', target: 'ep' },
        { source: 'ep', target: 'norm' },
        { source: 'norm', target: 'find' },
        { source: 'find', target: 'inn', label: 'ИНН известен' },
        { source: 'inn', target: 'enrich' },
        { source: 'find', target: 'enrich', label: 'без ИНН', dashed: true },
        { source: 'enrich', target: 'res' },
    ],
};

export const LEADS_FLOWS: Record<string, LeadsFlowDef> = {
    overview: OVERVIEW_FLOW,
    main: MAIN_FLOW,
    dedup: DEDUP_FLOW,
};
