import { getAdminLlmPrompt } from '@workspace/nest-admin-api';
import type { LlmPromptRun, LlmPromptRunResult, LlmPromptTargets } from '../../model';

/**
 * Единственное место с импортом сгенерированного клиента `admin-llm-prompt`
 * (паттерн vendor-settings-helper).
 */
export class LlmPromptHelper {
    private api = getAdminLlmPrompt();

    /** Исполнители с готовностью: без домена — общие ключи приложения. */
    targets(domain?: string): Promise<LlmPromptTargets> {
        return this.api.llmPromptTargets(domain ? { domain } : undefined);
    }

    /** Выполнить промпт выбранным исполнителем. */
    run(body: LlmPromptRun): Promise<LlmPromptRunResult> {
        return this.api.llmPromptRun(body);
    }
}
