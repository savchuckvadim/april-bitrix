import type { CabinetRole } from '../model';

/** Тексты раздела «Кабинет» карточки портала. */
export const CABINET_TEXT = {
    title: 'Кабинет клиента',
    description:
        'Кто из организации клиента видит кабинет портала (в Битрикс24 и на сайте bitrix.april-app.ru) и управляет им. Владелец — корневой пользователь организации: раздаёт доступы сотрудникам. April может всё то же за него.',
    guideLink: 'Путеводитель: как устроен кабинет и что проверить',
    clientTitle: 'Организация',
    clientNone:
        'Портал не привязан к организации. Создайте её здесь — портал привяжется сразу. Если у клиента уже есть организация (второй портал), выберите её ниже.',
    clientCreateName: 'Название организации',
    clientCreateEmail: 'Email организации (если есть)',
    clientCreate: 'Создать и привязать',
    clientOr: 'или уже заведённая организация',
    clientOpen: 'Страница клиента',
    clientPick: 'Выберите организацию',
    clientSave: 'Привязать',
    clientDetach: 'Отвязать',
    clientDetachConfirm:
        'Отвязать портал от организации? Возможно только без участников кабинета.',
    membersTitle: 'Участники',
    membersEmpty:
        'Участников пока нет. Первый добавленный станет владельцем кабинета.',
    addTitle: 'Дать доступ',
    addHint:
        'Email — на него уйдёт ссылка установки пароля. Почты у April пока нет: ссылка появится здесь — передайте её человеку сами (не в общий чат).',
    email: 'Email',
    firstName: 'Имя',
    lastName: 'Фамилия',
    bitrixUserId: 'ID в Битрикс24 (если знаете)',
    makeOwner: 'Сразу сделать владельцем',
    add: 'Дать доступ',
    approve: 'Подтвердить',
    makeOwnerAction: 'Сделать владельцем',
    makeOwnerConfirm:
        'Передать права владельца? Прежний владелец станет участником.',
    passwordLink: 'Ссылка на пароль',
    revoke: 'Снять доступ',
    revokeConfirm: 'Снять доступ к кабинету портала?',
    linkTitle: 'Ссылка для пароля',
    linkEmailSent: 'Письмо со ссылкой отправлено.',
    linkEmailNotSent:
        'Письмо НЕ отправлено (почта не настроена). Передайте ссылку человеку сами.',
    linkCopy: 'Скопировать',
    linkCopied: 'Ссылка скопирована',
    linkClose: 'Закрыть',
    telegramTitle: 'Telegram',
    telegramEmpty:
        'Привязанных чатов нет. Сотрудник привязывает Telegram сам: кабинет → «Привязать Telegram».',
    telegramRevoke: 'Отвязать',
    loading: 'Загрузка…',
    loadError: 'Не удалось загрузить кабинет портала',
    noPassword: 'пароль не задан',
    revoked: 'доступ снят',
} as const;

export const CABINET_ROLE_TITLE: Record<CabinetRole, string> = {
    owner: 'владелец',
    member: 'участник',
    pending: 'заявка',
};
