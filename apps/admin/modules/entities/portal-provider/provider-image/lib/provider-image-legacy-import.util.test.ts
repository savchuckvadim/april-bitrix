/**
 * Отбор файлов выбранной папки легаси и сборка тела запроса: берём только
 * png/jpg/jpeg, в запрос каждый файл уходит в поле `files` с путём внутри папки.
 */

import { describe, expect, it } from 'vitest';
import { PROVIDER_IMAGE_LEGACY_MAX_FILES } from '../model';
import {
    buildLegacyImportForm,
    checkLegacyImportSelection,
    isLegacyImportImage,
    legacyImportFileName,
    selectLegacyImportFiles,
} from './provider-image-legacy-import.util';

/** Файл как из выбора папки: `webkitRelativePath` выставляет браузер, в конструкторе его нет. */
const folderFile = (relativePath: string, content = 'x'): File => {
    const name = relativePath.split('/').pop() ?? relativePath;
    const file = new File([content], name);
    Object.defineProperty(file, 'webkitRelativePath', { value: relativePath });
    return file;
};

describe('isLegacyImportImage', () => {
    it('принимает png, jpg и jpeg в любом регистре', () => {
        for (const name of ['a.png', 'a.PNG', 'a.jpg', 'a.JPG', 'a.jpeg', 'a.JpEg']) {
            expect(isLegacyImportImage({ name }), name).toBe(true);
        }
    });

    it('отбрасывает остальные форматы и файлы без расширения', () => {
        for (const name of ['a.gif', 'a.webp', 'a.pdf', 'a.png.txt', 'png', '.DS_Store', 'Thumbs.db']) {
            expect(isLegacyImportImage({ name }), name).toBe(false);
        }
    });

    it('смотрит на последнее расширение имени с точками', () => {
        expect(isLegacyImportImage({ name: 'stamp.v2.final.png' })).toBe(true);
    });
});

describe('legacyImportFileName', () => {
    it('берёт путь внутри папки', () => {
        expect(legacyImportFileName(folderFile('legacy/rq/7/stamp.png'))).toBe('legacy/rq/7/stamp.png');
    });

    it('без пути папки остаётся имя файла', () => {
        expect(legacyImportFileName(new File(['x'], 'stamp.png'))).toBe('stamp.png');
    });
});

describe('selectLegacyImportFiles', () => {
    it('оставляет картинки, считает отброшенное и находит имя папки', () => {
        const selection = selectLegacyImportFiles([
            folderFile('legacy/b.jpg'),
            folderFile('legacy/readme.txt'),
            folderFile('legacy/sub/a.PNG'),
            folderFile('legacy/.DS_Store'),
        ]);

        expect(selection.files.map(legacyImportFileName)).toEqual([
            'legacy/b.jpg',
            'legacy/sub/a.PNG',
        ]);
        expect(selection.skipped).toBe(2);
        expect(selection.folder).toBe('legacy');
    });

    it('сортирует по пути: порядок выбора не влияет на запрос', () => {
        const forward = selectLegacyImportFiles([folderFile('d/a.png'), folderFile('d/b.png')]);
        const backward = selectLegacyImportFiles([folderFile('d/b.png'), folderFile('d/a.png')]);

        expect(forward.files.map(legacyImportFileName)).toEqual(['d/a.png', 'd/b.png']);
        expect(backward.files.map(legacyImportFileName)).toEqual(['d/a.png', 'd/b.png']);
    });

    it('пустой выбор не падает', () => {
        expect(selectLegacyImportFiles([])).toEqual({ files: [], skipped: 0, folder: null });
    });

    it('без путей папки имя папки неизвестно', () => {
        expect(selectLegacyImportFiles([new File(['x'], 'a.png')]).folder).toBeNull();
    });
});

describe('checkLegacyImportSelection', () => {
    const filesOf = (count: number): File[] =>
        Array.from({ length: count }, (_, index) => folderFile(`d/${index}.png`));

    it('пустой отбор объясняет причину', () => {
        expect(checkLegacyImportSelection({ files: [] })).toContain('нет файлов PNG и JPG');
    });

    it('до предела включительно можно отправлять', () => {
        expect(checkLegacyImportSelection({ files: filesOf(1) })).toBeNull();
        expect(
            checkLegacyImportSelection({ files: filesOf(PROVIDER_IMAGE_LEGACY_MAX_FILES) }),
        ).toBeNull();
    });

    it('сверх предела отправка закрыта и в тексте есть число и предел', () => {
        const message = checkLegacyImportSelection({
            files: filesOf(PROVIDER_IMAGE_LEGACY_MAX_FILES + 1),
        });

        expect(message).toContain(String(PROVIDER_IMAGE_LEGACY_MAX_FILES + 1));
        expect(message).toContain(String(PROVIDER_IMAGE_LEGACY_MAX_FILES));
    });
});

describe('buildLegacyImportForm', () => {
    it('кладёт каждый файл в поле files с путём внутри папки', () => {
        const form = buildLegacyImportForm([
            folderFile('legacy/rq/1/stamp.png', 'one'),
            folderFile('legacy/rq/2/logo.jpg', 'two'),
        ]);

        const sent = form.getAll('files');
        expect(sent).toHaveLength(2);
        expect(sent.map((entry) => (entry as File).name)).toEqual([
            'legacy/rq/1/stamp.png',
            'legacy/rq/2/logo.jpg',
        ]);
    });

    it('другие поля не добавляет', () => {
        const form = buildLegacyImportForm([folderFile('d/a.png')]);

        expect([...new Set([...form.keys()])]).toEqual(['files']);
    });

    it('содержимое файла остаётся прежним', async () => {
        const form = buildLegacyImportForm([folderFile('d/a.png', 'payload')]);

        expect(await (form.get('files') as File).text()).toBe('payload');
    });

    it('пустой список даёт пустое тело', () => {
        expect([...buildLegacyImportForm([]).keys()]).toEqual([]);
    });
});
