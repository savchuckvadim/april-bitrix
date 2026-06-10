/**
 * Utility functions for Word Templates
 */
import {
    WordTemplate,
    WordTemplateSummary,
    WordTemplateVisibility,
} from "../../types/word-template-types";

/**
 * Filter templates by visibility
 */
export const filterTemplatesByVisibility = (
    templates: WordTemplateSummary[],
    visibility: WordTemplateVisibility
): WordTemplateSummary[] => {
    return templates.filter((template) => template.visibility === visibility);
};

/**
 * Filter templates by active status
 */
export const filterTemplatesByActive = (
    templates: WordTemplateSummary[],
    isActive: boolean
): WordTemplateSummary[] => {
    return templates.filter((template) => template.is_active === isActive);
};

/**
 * Get default template from list
 */
export const getDefaultTemplate = (
    templates: WordTemplateSummary[]
): WordTemplateSummary | null => {
    return templates.find((template) => template.is_default) || null;
};

/**
 * Get active templates
 */
export const getActiveTemplates = (
    templates: WordTemplateSummary[]
): WordTemplateSummary[] => {
    return filterTemplatesByActive(templates, true);
};

/**
 * Search templates by name or code
 */
export const searchTemplates = (
    templates: WordTemplateSummary[],
    searchQuery: string
): WordTemplateSummary[] => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return templates;

    return templates.filter(
        (template) =>
            template.name.toLowerCase().includes(query) ||
            template.code.toLowerCase().includes(query) ||
            (template.tags && template.tags.toLowerCase().includes(query))
    );
};

/**
 * Sort templates by name
 */
export const sortTemplatesByName = (
    templates: WordTemplateSummary[],
    ascending: boolean = true
): WordTemplateSummary[] => {
    return [...templates].sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return ascending ? comparison : -comparison;
    });
};

/**
 * Sort templates by creation date
 */
export const sortTemplatesByDate = (
    templates: WordTemplateSummary[],
    ascending: boolean = false
): WordTemplateSummary[] => {
    return [...templates].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return ascending ? dateA - dateB : dateB - dateA;
    });
};

/**
 * Sort templates by counter (usage count)
 */
export const sortTemplatesByCounter = (
    templates: WordTemplateSummary[],
    ascending: boolean = false
): WordTemplateSummary[] => {
    return [...templates].sort((a, b) => {
        return ascending ? a.counter - b.counter : b.counter - a.counter;
    });
};

/**
 * Check if template is public
 */
export const isPublicTemplate = (
    template: WordTemplate | WordTemplateSummary
): boolean => {
    return template.visibility === WordTemplateVisibility.PUBLIC;
};

/**
 * Check if template is private
 */
export const isPrivateTemplate = (
    template: WordTemplate | WordTemplateSummary
): boolean => {
    return template.visibility === WordTemplateVisibility.PORTAL;
};

/**
 * Check if template is user-specific
 */
export const isUserTemplate = (
    template: WordTemplate | WordTemplateSummary
): boolean => {
    return template.visibility === WordTemplateVisibility.USER;
};

/**
 * Format template file size (if available)
 */
export const formatTemplateSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Get template download URL
 */
export const getTemplateDownloadUrl = (
    template: WordTemplate | WordTemplateSummary
): string | null => {
    return template.template_url || null;
};

/**
 * Group templates by visibility
 */
export const groupTemplatesByVisibility = (
    templates: WordTemplateSummary[]
): Record<string, WordTemplateSummary[]> => {
    const groups: Record<string, WordTemplateSummary[]> = {
        public: [],
        private: [],
        user: [],
    };

    templates.forEach((template) => {
        const visibility = template.visibility as string;
        if (groups[visibility]) {
            groups[visibility].push(template);
        }
    });

    return groups;
};

