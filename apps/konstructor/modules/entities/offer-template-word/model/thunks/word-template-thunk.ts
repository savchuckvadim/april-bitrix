/**
 * Алиасы к HTTP-слою в `lib/word-template-api` (исторические имена find* / update*).
 */
export {
    fetchAllWordTemplates as findAllWordTemplates,
    fetchPublicWordTemplates as findPublicWordTemplates,
    fetchWordTemplatesByPortal as findWordTemplatesByPortal,
    fetchUserWordTemplates as findUserWordTemplates,
    fetchWordTemplateById as findWordTemplateById,
    updateWordTemplateAPI as updateWordTemplate,
    setWordTemplateActiveAPI as setWordTemplateActive,
    setWordTemplateDefaultAPI as setWordTemplateDefault,
} from '../../lib/word-template-api';
