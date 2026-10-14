import type { DigestEmployee, DigestRecord } from '@/modules/entities/digest';

const PRESENTATION_TYPE = 'presentation';
const NOT_HELD_ACTIONS = new Set(['act_noresult_fail', 'pound', 'expired']);

export interface PresentationSlices {
    held: DigestRecord[];
    notHeld: DigestRecord[];
    plannedAtStart: DigestRecord[];
    plannedNext: DigestRecord[];
}

const isPresentation = (record: DigestRecord): boolean =>
    record.typeCode === PRESENTATION_TYPE;

/** Презентации сотрудника за день: проведено / не проведено / план на день / новые планы. */
export const splitPresentations = (employee: DigestEmployee): PresentationSlices => {
    const presentations = employee.records.filter(isPresentation);
    return {
        held: presentations.filter(record => record.actionCode === 'done'),
        notHeld: presentations.filter(record => NOT_HELD_ACTIONS.has(record.actionCode ?? '')),
        plannedAtStart: employee.plannedAtStartRecords.filter(isPresentation),
        plannedNext: presentations.filter(record => record.actionCode === 'plan'),
    };
};

export const PRESENTATION_TABS = [
    { key: 'held', label: 'Проведено' },
    { key: 'notHeld', label: 'Не проведено' },
    { key: 'plannedAtStart', label: 'План на день' },
    { key: 'plannedNext', label: 'Новые планы' },
] as const;

export type PresentationTabKey = (typeof PRESENTATION_TABS)[number]['key'];
