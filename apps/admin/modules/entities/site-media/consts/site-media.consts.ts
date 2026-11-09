import type { PlatformShotPriority } from '@workspace/site-media';

export const SITE_MEDIA_API_BASE = '/api/admin/site-media';
export const SITE_MEDIA_CACHE_KEY = 'site-media';

/**
 * Ролик до 80 МБ по медленной сети грузится дольше обычного таймаута
 * запросов админки (30 с) — у загрузки свой.
 */
export const SITE_MEDIA_UPLOAD_TIMEOUT_MS = 15 * 60_000;

export const SITE_MEDIA_PRIORITY_LABEL: Record<PlatformShotPriority, string> = {
    1: 'Первая очередь',
    2: 'Вторая очередь',
    3: 'Если будет время',
};

export const SITE_MEDIA_TEXT = {
    title: 'Картинки и видео сайта',
    description:
        'Скрины и ролики продающего раздела /platform. Файлы хранятся на сервере, а не в коде: загрузили — на сайте через пару минут, без выкладки. Замена — той же кнопкой, прежний файл удаляется сам. Пока у места нет файла, на сайте его нет вовсе: блок перестраивается без кадра.',
    loadError: 'Не удалось загрузить список файлов.',
    uploaded: 'Загружено',
    firstPriorityMissing: 'Первая очередь без файла',
    openPage: 'Открыть страницу',
    image: 'Скрин',
    video: 'Видео',
    hasFile: 'Есть файл',
    noFile: 'Нет файла',
    what: 'Что в кадре',
    where: 'Где снять',
    upload: 'Загрузить',
    replace: 'Заменить',
    uploadPoster: 'Постер',
    replacePoster: 'Заменить постер',
    removePoster: 'Убрать постер',
    remove: 'Удалить',
    uploading: 'Загрузка',
    removeTitle: 'Удалить файл с сайта?',
    removeDescription:
        'Файл удалится с сервера, на сайте место останется без кадра — блок перестроится. Вернуть можно только новой загрузкой.',
    orphansTitle: 'Не используются на сайте',
    orphansDescription:
        'Файлы мест, которых больше нет на страницах: кадр убрали из реестра. Их можно удалить.',
} as const;
