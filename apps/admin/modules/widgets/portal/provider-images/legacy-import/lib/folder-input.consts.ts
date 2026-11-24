import type { InputHTMLAttributes } from 'react';

/** Свойства поля выбора папки. `webkitdirectory` есть в браузерах, но нет в типах React. */
export type FolderInputProps = InputHTMLAttributes<HTMLInputElement> & {
    webkitdirectory?: string;
};

/** Поле выбирает папку целиком и отдаёт все вложенные файлы с путями (`webkitRelativePath`). */
export const FOLDER_INPUT_PROPS: FolderInputProps = {
    type: 'file',
    multiple: true,
    webkitdirectory: '',
};
