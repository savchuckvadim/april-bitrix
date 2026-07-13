import {
    getPbxRqInstall,
    getPbxRqInstallMonitoring,
    getPbxRqManage,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type {
    InstallRqResult,
    RqDeleteResult,
    RqFieldTemplate,
    RqMonitoring,
    RqParse,
    RqPortalPreset,
    RqPresetCode,
    RqPresetTemplate,
} from '../../model';

/**
 * Единственное место, где импортируются сгенерированные RQ-клиенты.
 * Оборачивает три контроллера pbx-install: install, manage (delete), monitoring.
 */
export class RqHelper {
    private install = getPbxRqInstall();
    private manage = getPbxRqManage();
    private monitoring = getPbxRqInstallMonitoring();

    /** Текущее состояние реквизитов на портале (статусы пресетов и полей). */
    getMonitoring(domain: string): Promise<RqMonitoring> {
        return this.monitoring.pbxRqInstallMonitoringMonitoring(domain);
    }

    /** Эталон (пресеты + поля), который будет установлен — для предпросмотра. */
    getParse(): Promise<RqParse> {
        return this.monitoring.pbxRqInstallMonitoringParse();
    }

    /** Установить эталон целиком (пресеты + поля, идемпотентно). */
    installAll(domain: string): Promise<InstallRqResult> {
        return this.install.pbxRqInstallInstall(domain);
    }

    /** Установить переданные пресеты. */
    installPresets(
        domain: string,
        presets: RqPresetTemplate[],
    ): Promise<InstallRqResult> {
        return this.install.pbxRqInstallInstallPresets(domain, { presets });
    }

    /** Установить переданные поля реквизита. */
    installFields(
        domain: string,
        fields: RqFieldTemplate[],
    ): Promise<InstallRqResult> {
        return this.install.pbxRqInstallInstallFields(domain, { fields });
    }

    /**
     * Привязать существующий пресет Bitrix к строке `bx_rqs` по бизнес-коду.
     * Меняется только зеркало в БД, в Bitrix ничего не создаётся.
     */
    setPresetBitrixId(
        domain: string,
        code: RqPresetCode,
        bitrixId: number,
    ): Promise<RqPortalPreset> {
        return this.manage.pbxRqManageSetPresetBitrixId({
            domain,
            code,
            bitrixId,
        });
    }

    /** Точечно удалить пресеты в Bitrix по списку bitrix-id. */
    deletePresets(domain: string, ids: number[]): Promise<RqDeleteResult> {
        return this.manage.pbxRqManageDeletePresets(domain, { ids });
    }

    /** Точечно удалить поля реквизита в Bitrix по списку id. */
    deleteFields(domain: string, ids: number[]): Promise<RqDeleteResult> {
        return this.manage.pbxRqManageDeleteFields(domain, { ids });
    }
}
