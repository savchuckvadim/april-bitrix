import { getAdminMethodologies } from '@workspace/nest-admin-api';
import type {
    MethodologyAssistResult,
    MethodologyCatalog,
    MethodologyConfig,
    MethodologyDetail,
    MethodologyItem,
    MethodologySave,
    MethodologyValidation,
} from '../../model';

/** Поля помощника: файл и/или текст, подсказки по имени, домен для ключей. */
export interface MethodologyAssistInput {
    file: File | null;
    text: string;
    domain: string | undefined;
    code: string;
    title: string;
}

/**
 * Единственное место с импортом сгенерированного клиента `admin-methodologies`
 * (паттерн vendor-settings-helper).
 */
export class MethodologiesHelper {
    private api = getAdminMethodologies();

    /** Строки таблицы и встроенные методики; с доменом — плюс свои методики портала. */
    async items(domain: string | undefined): Promise<MethodologyItem[]> {
        const result = await this.api.methodologyEditorAdminItems(
            domain ? { domain } : undefined,
        );
        return result.items;
    }

    /** Карточка строки по id либо встроенной по коду. */
    detail(id: string | null, code: string | null): Promise<MethodologyDetail> {
        return this.api.methodologyEditorAdminDetail({
            ...(id ? { id } : {}),
            ...(code ? { code } : {}),
        });
    }

    catalog(): Promise<MethodologyCatalog> {
        return this.api.methodologyEditorAdminCatalog();
    }

    validate(config: MethodologyConfig): Promise<MethodologyValidation> {
        return this.api.methodologyEditorAdminValidate({ config });
    }

    save(body: MethodologySave): Promise<MethodologyDetail> {
        return this.api.methodologyEditorAdminSave(body);
    }

    /** Черновик методики из документа; multipart собирает сгенерированный клиент. */
    assist(input: MethodologyAssistInput): Promise<MethodologyAssistResult> {
        return this.api.methodologyAssistAssist({
            ...(input.file ? { file: input.file } : {}),
            ...(input.text.trim() ? { text: input.text.trim() } : {}),
            ...(input.domain ? { domain: input.domain } : {}),
            ...(input.code.trim() ? { code: input.code.trim() } : {}),
            ...(input.title.trim() ? { title: input.title.trim() } : {}),
        });
    }
}
