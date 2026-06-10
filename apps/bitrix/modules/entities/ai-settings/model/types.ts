import type {
    DomainTreeNodeDto,
    PromptGetResponseDto,
    PromptValidationIssueDto,
} from '@workspace/ai-api/src/generated/model';

export type PromptKind = 'resume' | 'recomendation';

export type AuthMode = 'secret' | 'manual';

export interface FlatTreeNode {
    name: string;
    path: string;
    type: 'dir' | 'file';
    size?: number | null;
    depth: number;
}

export interface PromptFormState {
    resume: string;
    recomendation: string;
}

export interface PromptMetaState {
    resume?: PromptGetResponseDto;
    recomendation?: PromptGetResponseDto;
}

export interface SaveResultState {
    kind: PromptKind;
    ok: boolean;
    issues: PromptValidationIssueDto[];
    message: string;
}

export type TreeNode = DomainTreeNodeDto;
