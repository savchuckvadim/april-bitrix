'use client';

import * as React from 'react';
import { ACard, Field, FieldInput } from '@workspace/ui';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Textarea } from '@workspace/ui/components/textarea';
import { useAiAdminSettings } from '../lib/hooks/use-ai-admin-settings';
import { flattenTree, findRetriveNode, getRetriveRelativePath } from '../model/utils';
import { PromptKind } from '../model/types';

const kinds: PromptKind[] = ['resume', 'recomendation'];

export function AiAdminSettingsPanel() {
    const {
        domain,
        setDomain,
        authMode,
        setAuthMode,
        adminSecret,
        setAdminSecret,
        adminTs,
        setAdminTs,
        adminToken,
        setAdminToken,
        activeKind,
        setActiveKind,
        selectedRetrivePath,
        setSelectedRetrivePath,
        files,
        setFiles,
        promptDrafts,
        setPromptDrafts,
        promptMeta,
        saveResult,
        treeQuery,
        loadWorkspace,
        savePromptMutation,
        uploadMutation,
        deletePathMutation,
        downloadMutation,
    } = useAiAdminSettings();

    const root = treeQuery.data?.root;
    const retriveNode = findRetriveNode(root, activeKind);
    const retriveRows = flattenTree(retriveNode);
    const hasLoading =
        treeQuery.isFetching || savePromptMutation.isPending || uploadMutation.isPending;

    return (
        <div className="container mx-auto max-w-6xl py-6 space-y-6">
            <ACard title="AI Admin Settings" description="Доменная настройка prompt и retrive">
                <div className="grid gap-4 md:grid-cols-2">
                    <FieldInput
                        label="Domain"
                        placeholder="gsr.bitrix24.ru"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                    />

                    <Field label="Auth mode">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={authMode === 'manual' ? 'default' : 'outline'}
                                onClick={() => setAuthMode('manual')}
                            >
                                Manual token
                            </Button>
                            <Button
                                type="button"
                                variant={authMode === 'secret' ? 'default' : 'outline'}
                                onClick={() => setAuthMode('secret')}
                            >
                                Sign by secret
                            </Button>
                        </div>
                    </Field>

                    {authMode === 'secret' ? (
                        <FieldInput
                            label="Admin secret"
                            type="password"
                            value={adminSecret}
                            onChange={(e) => setAdminSecret(e.target.value)}
                        />
                    ) : (
                        <FieldInput
                            label="X-Admin-Token"
                            value={adminToken}
                            onChange={(e) => setAdminToken(e.target.value)}
                        />
                    )}

                    <FieldInput
                        label="X-Admin-Ts (optional)"
                        placeholder="unix ts, auto if empty"
                        value={adminTs}
                        onChange={(e) => setAdminTs(e.target.value)}
                    />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={() => void loadWorkspace()} disabled={!domain || hasLoading}>
                        Загрузить workspace
                    </Button>
                    {treeQuery.error && (
                        <p className="text-sm text-destructive">
                            {(treeQuery.error as Error).message}
                        </p>
                    )}
                </div>
            </ACard>

            <Tabs value={activeKind} onValueChange={(v) => setActiveKind(v as PromptKind)}>
                <TabsList>
                    <TabsTrigger value="resume">resume</TabsTrigger>
                    <TabsTrigger value="recomendation">recomendation</TabsTrigger>
                </TabsList>

                {kinds.map((kind) => (
                    <TabsContent key={kind} value={kind} className="space-y-6">
                        <ACard
                            title={`Prompt: ${kind}`}
                            description={`Source: ${promptMeta[kind]?.source ?? '-'}`}
                        >
                            <Field label="Prompt text">
                                <Textarea
                                    className="min-h-[280px]"
                                    value={promptDrafts[kind]}
                                    onChange={(e) =>
                                        setPromptDrafts((prev) => ({
                                            ...prev,
                                            [kind]: e.target.value,
                                        }))
                                    }
                                />
                            </Field>

                            <div className="mt-4 flex items-center gap-3">
                                <Button
                                    onClick={() =>
                                        savePromptMutation.mutate({
                                            kind,
                                            prompt: promptDrafts[kind],
                                        })
                                    }
                                    disabled={savePromptMutation.isPending}
                                >
                                    Сохранить prompt
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    hash: {promptMeta[kind]?.contentHash ?? '-'}
                                </span>
                            </div>

                            {saveResult && saveResult.kind === kind && (
                                <div className="mt-4 space-y-2">
                                    <p
                                        className={`text-sm ${
                                            saveResult.ok ? 'text-green-600' : 'text-destructive'
                                        }`}
                                    >
                                        {saveResult.message}
                                    </p>
                                    {saveResult.issues.length > 0 && (
                                        <ul className="space-y-1 text-sm">
                                            {saveResult.issues.map((issue, index) => (
                                                <li key={`${issue.path}-${index}`} className="text-destructive">
                                                    [{issue.tag}] {issue.path}: {issue.reason}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </ACard>

                        <ACard
                            title={`Materials: ${kind}/retrive`}
                            description="Таблица файлов и папок в retrive"
                        >
                            <div className="grid gap-3 md:grid-cols-[1fr,auto,auto]">
                                <Field label="targetPath">
                                    <Input
                                        placeholder="например objections/new_clients"
                                        value={selectedRetrivePath}
                                        onChange={(e) => setSelectedRetrivePath(e.target.value)}
                                    />
                                </Field>
                                <Field label="Файлы">
                                    <Input
                                        type="file"
                                        multiple
                                        accept=".txt,.pdf,.docx"
                                        onChange={(e) =>
                                            setFiles(Array.from(e.target.files ?? []))
                                        }
                                    />
                                </Field>
                                <div className="flex items-end gap-2">
                                    <Button
                                        onClick={() => uploadMutation.mutate()}
                                        disabled={uploadMutation.isPending || files.length === 0}
                                    >
                                        Upload
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => downloadMutation.mutate(selectedRetrivePath || undefined)}
                                        disabled={downloadMutation.isPending}
                                    >
                                        Download
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-4 overflow-x-auto rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-2 text-left">Path</th>
                                            <th className="p-2 text-left">Type</th>
                                            <th className="p-2 text-left">Size</th>
                                            <th className="p-2 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {retriveRows.map((node) => {
                                            const relativePath = getRetriveRelativePath(
                                                kind,
                                                node.path
                                            );
                                            const canDelete = node.type === 'file' || Boolean(relativePath);

                                            return (
                                                <tr key={node.path} className="border-t">
                                                    <td className="p-2">
                                                        <span style={{ paddingLeft: node.depth * 12 }}>
                                                            {node.name}
                                                        </span>
                                                    </td>
                                                    <td className="p-2">{node.type}</td>
                                                    <td className="p-2">{node.size ?? '-'}</td>
                                                    <td className="p-2">
                                                        <div className="flex flex-wrap gap-2">
                                                            {node.type === 'dir' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        setSelectedRetrivePath(relativePath)
                                                                    }
                                                                >
                                                                    Set target
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    downloadMutation.mutate(
                                                                        relativePath || undefined
                                                                    )
                                                                }
                                                            >
                                                                Download
                                                            </Button>
                                                            {canDelete && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        deletePathMutation.mutate(relativePath)
                                                                    }
                                                                >
                                                                    Delete
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </ACard>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
