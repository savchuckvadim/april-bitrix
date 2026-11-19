'use client';

import { FieldCombobox } from '@workspace/april-ui/fields';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { ConfirmDialog } from '@/modules/shared/ui';
import {
    OFFER_LETTER_DELETE_TEXT as DELETE_TEXT,
    OFFER_LETTER_SCOPE_OPTIONS,
    OFFER_LETTER_TEXT as TEXT,
} from '../../consts/offer-letter.consts';
import type { OfferLetterScopeFilter } from '../../model';
import { OfferLetterDialog } from '../offer-letter-dialog/OfferLetterDialog';
import { OfferLetterTable } from '../offer-letter-table/OfferLetterTable';
import { useOfferLettersPanel } from './hooks/use-offer-letters-panel';

/**
 * Письма КП выбранного портала: таблица с переключателями, создание и правка
 * в окне с редактором, удаление с подтверждением.
 */
export function OfferLettersPanel() {
    const panel = useOfferLettersPanel();

    return (
        <div className="space-y-4">
            <p className="max-w-3xl text-sm text-muted-foreground">{TEXT.description}</p>

            <div className="flex flex-wrap items-end gap-4">
                <FieldCombobox
                    id="offer-letters-portal"
                    label={TEXT.portal}
                    options={panel.portalOptions}
                    value={panel.domain}
                    onChange={panel.setDomain}
                    placeholder={TEXT.portalPlaceholder}
                    searchPlaceholder={TEXT.portalSearch}
                    emptyText={TEXT.portalEmpty}
                    className="w-80"
                />

                {panel.portalId ? (
                    <>
                        <div className="w-64 space-y-1.5">
                            <Label htmlFor="offer-letters-scope" className="text-xs font-semibold">
                                {TEXT.scopeFilter}
                            </Label>
                            <Select
                                value={panel.scope}
                                onValueChange={value =>
                                    panel.setScope(value as OfferLetterScopeFilter)
                                }
                            >
                                <SelectTrigger id="offer-letters-scope">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {OFFER_LETTER_SCOPE_OPTIONS.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={panel.openCreate}>{TEXT.create}</Button>
                    </>
                ) : null}
            </div>

            {panel.portalId ? (
                <>
                    {panel.isError ? (
                        <p className="text-sm text-destructive">{TEXT.loadError}</p>
                    ) : null}

                    <OfferLetterTable
                        data={panel.letters}
                        managerNames={panel.managerNames}
                        isLoading={panel.isLoading}
                        emptyMessage={panel.hasLetters ? TEXT.emptyFilter : TEXT.empty}
                        pendingId={panel.pendingId}
                        onToggleActive={(letter, isActive) =>
                            void panel.toggleActive(letter, isActive)
                        }
                        onSetDefault={letter => void panel.setDefault(letter)}
                        onEdit={panel.openEdit}
                        onDelete={panel.setLetterToDelete}
                    />

                    <OfferLetterDialog
                        open={panel.isDialogOpen}
                        onOpenChange={panel.setDialogOpen}
                        portalId={panel.portalId}
                        letter={panel.editedLetter}
                    />
                </>
            ) : (
                <p className="text-sm text-muted-foreground">{TEXT.portalPrompt}</p>
            )}

            <ConfirmDialog
                open={Boolean(panel.letterToDelete)}
                onOpenChange={open => {
                    if (!open) panel.setLetterToDelete(null);
                }}
                title={DELETE_TEXT.title}
                description={
                    panel.letterToDelete?.isDefault
                        ? DELETE_TEXT.descriptionDefault
                        : DELETE_TEXT.description
                }
                onConfirm={() => void panel.confirmDelete()}
                confirmLabel={DELETE_TEXT.confirm}
                variant="destructive"
                isLoading={panel.isDeleting}
            />
        </div>
    );
}
