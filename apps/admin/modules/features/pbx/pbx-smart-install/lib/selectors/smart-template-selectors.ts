import type {
    PbxGroupDefinitionDto,
    PbxSmartDefinitionDto,
} from '@workspace/nest-api';

/**
 * Return all smarts across every group of the registry.
 * Each smart is annotated with its parent group code.
 */
export function getAllSmartTemplates(
    groups: PbxGroupDefinitionDto[],
): Array<PbxSmartDefinitionDto & { group: string }> {
    return groups.flatMap((g) =>
        (g.smarts ?? []).map((s) => ({ ...s, group: g.group })),
    );
}

/**
 * Return all smarts belonging to a specific group.
 */
export function getSmartTemplatesByGroup(
    groups: PbxGroupDefinitionDto[],
    group: string,
): Array<PbxSmartDefinitionDto & { group: string }> {
    return getAllSmartTemplates(groups).filter((s) => s.group === group);
}

/**
 * Find a single smart template by group + smartCode.
 * Returns undefined if not found.
 */
export function findSmartTemplate(
    groups: PbxGroupDefinitionDto[],
    group: string,
    smartCode: string,
): (PbxSmartDefinitionDto & { group: string }) | undefined {
    return getAllSmartTemplates(groups).find(
        (s) => s.group === group && s.code === smartCode,
    );
}
