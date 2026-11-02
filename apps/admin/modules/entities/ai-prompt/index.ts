/** Публичная поверхность раздела «Запрос к модели». */
export { AiPromptPage } from './ui/AiPromptPage/AiPromptPage';
export { useLlmPromptRun, useLlmPromptTargets } from './lib/hooks/use-llm-prompt';
export { AI_PROMPT_PATH } from './model';
export type { LlmPromptRun, LlmPromptRunResult, LlmPromptTargetInfo } from './model';
