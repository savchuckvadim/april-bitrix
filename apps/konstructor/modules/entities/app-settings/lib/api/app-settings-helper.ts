import { getKonstructorAppSettings } from '@workspace/nest-konstructor-api';
import type { KonstructorAppSettings } from '../../model/dto';

const APP_CODE = 'konstructor';

/** Единственное место импорта api-пакета для портальных настроек приложения. */
export class AppSettingsHelper {
    private api = getKonstructorAppSettings();

    /** Действующие настройки конструктора на домене (ключ → значение + storedKeys). */
    async fetch(domain: string): Promise<KonstructorAppSettings> {
        return this.api.konstructorAppSettingsResolve(APP_CODE, { domain });
    }
}
